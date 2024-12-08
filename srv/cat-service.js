const cds = require('@sap/cds');
const SequenceHelper = require("./lib/SequenceHelper");
const FormData = require('form-data');
const { SELECT } = require('@sap/cds/lib/ql/cds-ql');
const LOG = cds.log('cat-service.js')
const { S3Client, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const MAX_RETRIES = 30;
const RETRY_DELAY_MS = 3000;


class InvCatalogService extends cds.ApplicationService {
    async init() {
        const {
            Invoice,
            InvoiceItem,
            PurchaseOrder,
            PurchaseOrderItem,
            A_MaterialDocumentHeader,
            A_MaterialDocumentItem,
            attachments,
        } = this.entities;

        const [DocumentExtraction_Dest] = await Promise.all([
            cds.connect.to('DocumentExtraction_Dest')
        ]);
        const db = await cds.connect.to("db");
        const pos = await cds.connect.to('CE_PURCHASEORDER_0001');
        const grs = await cds.connect.to('API_MATERIAL_DOCUMENT_SRV');
        const NEW_STATUS = 'N';
        const DRAFT_STATUS = 'D';
        const FAILURE_STATUS = 'F';

        this.DocumentExtraction_Dest = DocumentExtraction_Dest;

        this.before("NEW", Invoice.drafts, async (req) => {
            // console.log(req.target.name)
            if (req.target.name !== "InvCatalogService.Invoice.drafts") { return; }
            const { ID } = req.data;
            req.data.statusFlag = DRAFT_STATUS;

            const documentId = new SequenceHelper({
                db: db,
                sequence: "ZSUPPLIER_DOCUMENT_ID",
                table: "zsupplier_InvoiceEntity",
                field: "documentId",
            });

            let number = await documentId.getNextNumber();
            req.data.documentId = number.toString();;

        });

        this.before("SAVE", Invoice, async (req) => {
            if (!req.data.fiscalYear) {

                //getting base64 content
                const content = await cds.run(SELECT.one.from(attachments.drafts).
                    columns('ID', 'url', 'content', 'mimeType', 'filename').where({ up__ID: req.data.ID }));
                let fileBuffer;
                if (content?.content) {
                    try {
                        fileBuffer = await streamToBuffer(content.content);
                    } catch (error) {
                        req.error(400, "Error converting stream to Base64");
                        if (req.errors) { req.reject(); }
                    }

                    //creating form data
                    const form = new FormData();
                    try {
                        form.append('file', fileBuffer, content.filename || 'file', content.mimeType || 'application/octet-stream');
                    } catch (error) {
                        const response = `Status update failed: ${error.message}`
                        req.error(400, "Error converting stream to Base64",);
                        if (req.errors) { req.reject(); }
                    }
                    const options = {
                        schemaName: 'SAP_invoice_schema',
                        clientId: 'default',
                        documentType: 'Invoice',
                        receivedDate: new Date().toISOString().slice(0, 10),
                        enrichment: {
                            sender: { top: 5, type: "businessEntity", subtype: "supplier" },
                            employee: { type: "employee" }
                        }
                    };
                    form.append('options', JSON.stringify(options));

                    let status = '';
                    let extractionResults;

                    // Submit document for extraction with error handling
                    try {
                        const extractionResponse = await this.DocumentExtraction_Dest.send({
                            method: 'POST',
                            path: '/',
                            data: form,
                            headers: {
                                'Content-Type': 'multipart/form-data',
                                'Content-Length': form.getLengthSync()
                            }
                        });

                        if (extractionResponse.status === 'PENDING') {
                            // Poll for results
                            let retries = 0;
                            let jobDone = false;

                            while (!jobDone && retries < MAX_RETRIES) {
                                const jobStatus = await this.DocumentExtraction_Dest.get(`/${extractionResponse.id}`);
                                console.log(`Attempt ${retries + 1}: Current job status is '${jobStatus.status}'`);

                                if (jobStatus.status === "DONE") {
                                    jobDone = true;
                                    extractionResults = jobStatus.extraction;
                                } else {
                                    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
                                    retries++;
                                }
                            }

                            if (!jobDone) {
                                status = `Extraction failed after ${MAX_RETRIES} attempts`;
                                // await updateDraftOnly(req.data.SalesOrder.ID, status);
                                return;
                            }
                        }
                    } catch (error) {
                        status = `Document extraction failed: ${error.message}`;
                        // await updateDraftOnly(req.data.SalesOrder.ID, status);
                        return;
                    }

                    // Map extraction results
                    // const headerFields = extractionResults.headerFields.reduce((acc, field) => {
                    //     acc[field.name] = field.value;
                    //     return acc;
                    // }, {});

                    // const lineItems = extractionResults.lineItems.map(item => {
                    //     return item.reduce((acc, field) => {
                    //         acc[field.name] = field.value;
                    //         return acc;
                    //     }, {});
                    // });

                }
            } else {

            }
        });

        async function streamToBuffer(stream) {
            return new Promise((resolve, reject) => {
                const chunks = [];
                stream.on('data', (chunk) => chunks.push(Buffer.from(chunk))); // Collect chunks as Buffers
                stream.on('error', (err) => reject(err)); // Handle errors
                stream.on('end', () => resolve(Buffer.concat(chunks))); // Resolve final Buffer
            });
        }



        this.on('threewaymatch', 'Invoice', async req => {
            try {
                console.log("Three-way Verification Code Check");
                const { ID } = req.params[0];
                if (!ID) {
                    return req.error(400, "Invoice ID is required");
                }

                // Fetch invoice
                const invoice = await db.run(SELECT.one.from(Invoice).where({ ID: ID }));
                if (!invoice) {
                    return req.error(404, `Invoice with ID ${ID} not found`);
                }

                // Fetch invoice items
                const invoiceItems = await db.run(SELECT.from(InvoiceItem).where({ up__ID: ID }));
                if (!invoiceItems || invoiceItems.length === 0) {
                    return req.error(404, `No items found for Invoice ${ID}`);
                }

                let allItemsMatched = true;
                let itemCounter = 1;
                let allStatusReasons = [];
                let result = {
                    FiscalYear: "",
                    CompanyCode: "",
                    DocumentDate: null,
                    PostingDate: null,
                    SupplierInvoiceIDByInvcgParty: "",
                    DocumentCurrency: "",
                    InvoiceGrossAmount: invoice.invGrossAmount.toString(),
                    status: "",
                    to_SuplrInvcItemPurOrdRef: []
                };

                for (const invoiceItem of invoiceItems) {
                    const { purchaseOrder, purchaseOrderItem, sup_InvoiceItem, quantityPOUnit, supInvItemAmount } = invoiceItem;

                    // Fetch PO details
                    const purchaseOrderData = await pos.run(SELECT.one.from(PurchaseOrder).where({ PurchaseOrder: purchaseOrder }));
                    if (!purchaseOrderData) {
                        allItemsMatched = false;
                        allStatusReasons.push(`Item ${sup_InvoiceItem}: Purchase Order not found`);
                        continue;
                    }

                    const purchaseOrderItemData = await pos.run(SELECT.one.from(PurchaseOrderItem).where({ PurchaseOrder: purchaseOrder, PurchaseOrderItem: purchaseOrderItem }));
                    if (!purchaseOrderItemData) {
                        allItemsMatched = false;
                        allStatusReasons.push(`Item ${sup_InvoiceItem}: Purchase Order Item not found`);
                        continue;
                    }

                    // Fetch GR details
                    const materialDocumentData = await grs.run(
                        SELECT.one.from(A_MaterialDocumentHeader)
                            .where({ ReferenceDocument: purchaseOrder })
                    );

                    let materialItemData;
                    if (materialDocumentData) {
                        materialItemData = await grs.run(
                            SELECT.one.from(A_MaterialDocumentItem)
                                .where({
                                    MaterialDocument: materialDocumentData.MaterialDocument,
                                    MaterialDocumentYear: materialDocumentData.MaterialDocumentYear,
                                    PurchaseOrderItem: purchaseOrderItem
                                })
                        );
                    }

                    // Determine item status
                    let itemStatus = 'Matched';
                    let statusReasons = [];

                    // Convert quantityPOUnit from string to number
                    const quantityPOUnitNumber = Number(quantityPOUnit);

                    // Ensure supInvItemAmount and purchaseOrderItemData.NetPriceAmount are numbers
                    const supInvItemAmountNumber = Number(supInvItemAmount);
                    const netPriceAmountNumber = Number(purchaseOrderItemData.NetPriceAmount);

                    // Compare quantityPOUnit with purchaseOrderItemData.OrderQuantity
                    if (quantityPOUnitNumber !== purchaseOrderItemData.OrderQuantity) {
                        itemStatus = 'Discrepancy';
                        statusReasons.push('Quantity mismatch with PO');
                    }

                    // Compare supInvItemAmount with purchaseOrderItemData.NetPriceAmount
                    if (supInvItemAmountNumber !== netPriceAmountNumber) {
                        itemStatus = 'Discrepancy';
                        statusReasons.push('Amount mismatch with PO');
                    }

                    // Check if materialItemData exists and compare quantities
                    if (!materialItemData) {
                        itemStatus = 'Discrepancy';
                        statusReasons.push('No matching Goods Receipt found');
                    } else {
                        const materialQuantityNumber = Number(materialItemData.QuantityInBaseUnit);
                        if (quantityPOUnitNumber > materialQuantityNumber) {
                            itemStatus = 'Discrepancy';
                            statusReasons.push('Quantity mismatch with GR (Partial delivery)');
                        }
                        if (quantityPOUnitNumber < materialQuantityNumber) {
                            itemStatus = 'Discrepancy';
                            statusReasons.push('Quantity mismatch with GR (Over-delivery)');
                        }
                    }

                    if (itemStatus !== 'Matched') {
                        allItemsMatched = false;
                        if (statusReasons.length > 0) {
                            allStatusReasons.push(`Item ${purchaseOrderItem}: ${statusReasons.join(', ')}`);
                        }
                    }

                    // Populate result object
                    result.FiscalYear = materialItemData ? materialItemData.ReferenceDocumentFiscalYear : "";
                    result.CompanyCode = purchaseOrderData.CompanyCode;
                    result.DocumentDate = materialDocumentData ? materialDocumentData.DocumentDate : null;
                    result.PostingDate = materialDocumentData ? materialDocumentData.PostingDate : null;
                    result.SupplierInvoiceIDByInvcgParty = purchaseOrderData.SupplierInvoiceIDByInvcgParty;
                    result.DocumentCurrency = purchaseOrderData.DocumentCurrency;
                    result.to_SuplrInvcItemPurOrdRef.push({
                        SupplierInvoice: invoiceItem.supplierInvoice,
                        FiscalYear: materialItemData ? materialItemData.ReferenceDocumentFiscalYear : "",
                        SupplierInvoiceItem: itemCounter.toString(),
                        PurchaseOrder: purchaseOrder,
                        PurchaseOrderItem: purchaseOrderItem,
                        ReferenceDocument: materialItemData ? materialItemData.MaterialDocument : "",
                        ReferenceDocumentFiscalYear: materialItemData ? materialItemData.ReferenceDocumentFiscalYear : "",
                        ReferenceDocumentItem: materialItemData ? materialItemData.MaterialDocumentItem : "",
                        TaxCode: purchaseOrderItemData.TaxCode,
                        DocumentCurrency: purchaseOrderItemData.DocumentCurrency,
                        SupplierInvoiceItemAmount: supInvItemAmount.toString(),
                        PurchaseOrderQuantityUnit: purchaseOrderItemData.PurchaseOrderQuantityUnit,
                        QuantityInPurchaseOrderUnit: purchaseOrderItemData.OrderQuantity.toString(),
                    });

                    itemCounter += 1;
                }

                // Determine overall invoice status and update the database
                const overallStatus = allItemsMatched ? 'Matched' : 'Discrepancy';
                let statusWithReasons = overallStatus;
                let failFlag = 'S';

                if (overallStatus === 'Discrepancy') {
                    statusWithReasons += `: ${allStatusReasons.join('; ')}`;
                }
                const overallStatusFlag = failFlag ? 'E' : 'S';
                await db.run(UPDATE(Invoice).set({ status: statusWithReasons, statusFlag: overallStatusFlag }).where({ ID: ID }));

                // Set the status in the result object
                result.status = statusWithReasons;

                // Send response
                return req.reply(result);

            } catch (error) {
                console.error("Unexpected error in ThreeWayMatch:", error);
                return req.error(500, `Unexpected error: ${error.message}`);//COMMENT
            }
        });

        return super.init();
    }
}

module.exports = InvCatalogService;
