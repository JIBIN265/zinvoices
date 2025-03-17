const cds = require('@sap/cds');
const SequenceHelper = require("./lib/SequenceHelper");
const FormData = require('form-data');
const { SELECT } = require('@sap/cds/lib/ql/cds-ql');
const MAX_RETRIES = 30;
const RETRY_DELAY_MS = 3000;
const { uuid } = cds.utils;
const { Readable } = require("stream");
const fs = require('fs');
const path = require('path');
const { executeHttpRequest } = require("@sap-cloud-sdk/http-client");

class InvCatalogService extends cds.ApplicationService {
    async init() {
        const {
            Invoice,
            InvoiceItem,
            Material,
            MaterialItem,
            Product,
            PurchaseOrder,
            PurchaseOrderItem,
            A_MaterialDocumentHeader,
            A_MaterialDocumentItem
        } = this.entities;

        // const [DocumentExtraction_Dest] = await Promise.all([
        //     cds.connect.to('DocumentExtraction_Dest')
        // ]);
        const db = await cds.connect.to("db");
        const pos = await cds.connect.to('CE_PURCHASEORDER_0001');
        const grs = await cds.connect.to('API_MATERIAL_DOCUMENT_SRV');
        const invoiceDest = await cds.connect.to('API_SUPPLIERINVOICE_PROCESS_SRV');
        const prs = await cds.connect.to('API_PRODUCT_SRV');
        const DocumentExtraction_Dest = await cds.connect.to('DocumentExtraction_Dest');

        this.before("NEW", Invoice.drafts, async (req) => {
            // console.log(req.target.name)
            if (req.target.name !== "InvCatalogService.Invoice.drafts") { return; }
            const { ID } = req.data;
            req.data.statusFlag = 'D';

            const documentId = new SequenceHelper({
                db: db,
                sequence: "ZSUPPLIER_DOCUMENT_ID",
                table: "zsupplier_InvoiceEntity",
                field: "documentId",
            });

            let number = await documentId.getNextNumber();
            req.data.documentId = number.toString();;

        });

        this.before("NEW", Material.drafts, async (req) => {
            // console.log(req.target.name)
            if (req.target.name !== "InvCatalogService.Material.drafts") { return; }
            const { ID } = req.data;
            req.data.statusFlag = 'D';

            const documentId = new SequenceHelper({
                db: db,
                sequence: "ZMATERIAL_DOCUMENT_ID",
                table: "zsupplier_MaterialEntity",
                field: "documentId",
            });

            let number = await documentId.getNextNumber();
            req.data.documentId = number.toString();;

        });

        this.before("NEW", Product.drafts, async (req) => {
            // console.log(req.target.name)
            if (req.target.name !== "InvCatalogService.Product.drafts") { return; }
            const { ID } = req.data;
            req.data.statusFlag = 'D';

            const documentId = new SequenceHelper({
                db: db,
                sequence: "ZMATERIAL_DOCUMENT_ID",
                table: "zsupplier_MaterialEntity",
                field: "documentId",
            });

            let number = await documentId.getNextNumber();
            req.data.documentId = number.toString();;

        });

        // this.before("SAVE", Product, async (req) => {
        //     try {
        //         // Prepare the payload
        //         const payload = {
        //             Product: req.data.Product,
        //             ProductType: req.data.ProductType,
        //             GrossWeight: req.data.GrossWeight,
        //             WeightUnit: req.data.WeightUnit,
        //             NetWeight: req.data.NetWeight,
        //             ProductGroup: req.data.ProductGroup,
        //             BaseUnit: req.data.BaseUnit,
        //             ItemCategoryGroup: req.data.ItemCategoryGroup,
        //             IndustrySector: req.data.IndustrySector,

        //             // Plant Data
        //             to_Plant: {
        //                 results: req.data.to_Plant?.results?.map(item => ({
        //                     Product: req.data.Product,
        //                     Plant: item.Plant,
        //                     AvailabilityCheckType: item.AvailabilityCheckType,
        //                     PeriodType: item.PeriodType,
        //                     ProfitCenter: item.ProfitCenter,
        //                     MaintenanceStatusName: item.MaintenanceStatusName,
        //                     FiscalYearCurrentPeriod: item.FiscalYearCurrentPeriod,
        //                     FiscalMonthCurrentPeriod: item.FiscalMonthCurrentPeriod,
        //                     BaseUnit: item.BaseUnit,
        //                 })) || []
        //             },

        //             // Sales & Delivery Data
        //             to_SalesDelivery: {
        //                 results: req.data.to_SalesDelivery?.results?.map(item => ({
        //                     Product: req.data.Product,
        //                     ProductSalesOrg: item.ProductSalesOrg,
        //                     ProductDistributionChnl: item.ProductDistributionChnl,
        //                     MinimumOrderQuantity: item.MinimumOrderQuantity,
        //                     SupplyingPlant: item.SupplyingPlant,
        //                     PriceSpecificationProductGroup: item.PriceSpecificationProductGroup,
        //                     AccountDetnProductGroup: item.AccountDetnProductGroup,
        //                     DeliveryNoteProcMinDelivQty: item.DeliveryNoteProcMinDelivQty,
        //                     ItemCategoryGroup: item.ItemCategoryGroup,
        //                     BaseUnit: item.BaseUnit,
        //                 })) || []
        //             },

        //             // Product Sales Tax Data
        //             to_ProductSalesTax: {
        //                 results: req.data.to_ProductSalesTax?.results?.map(item => ({
        //                     Product: req.data.Product,
        //                     Country: item.Country,
        //                     TaxCategory: item.TaxCategory,
        //                     TaxClassification: item.TaxClassification,
        //                 })) || []
        //             },

        //             // Product Procurement Data (Single Entity)
        //             to_ProductProcurement: {
        //                 Product: req.data.Product,
        //                 PurchaseOrderQuantityUnit: req.data.to_ProductProcurement?.PurchaseOrderQuantityUnit || "",
        //                 VarblPurOrdUnitStatus: req.data.to_ProductProcurement?.VarblPurOrdUnitStatus || "",
        //                 PurchasingAcknProfile: req.data.to_ProductProcurement?.PurchasingAcknProfile || ""
        //             }
        //         };

        //         // Post the payload to the destination
        //         const response = await prs.post('/A_Product', payload);
        //         req.data.status = 'Product Created';

        //     } catch (error) {
        //         console.error('Error while posting Product:', error.message);
        //         req.data.statusFlag = 'E';
        //         req.data.status = error.message;
        //         req.errors(400, error.message);
        //         if (req.errors) { req.reject(); }
        //     }
        // });


        this.before("SAVE", Material, async (req) => {

            try {

                //     // Prepare the payload
                const payload = {
                    DocumentDate: `/Date(${new Date(req.data.documentDate).getTime()})/`,
                    PostingDate: `/Date(${new Date(req.data.postingDate).getTime()})/`,
                    MaterialDocumentHeaderText: req.data.MaterialDocumentHeaderText,
                    ReferenceDocument: req.data.ReferenceDocument,
                    VersionForPrintingSlip: req.data.VersionForPrintingSlip,
                    GoodsMovementCode: req.data.GoodsMovementCode,
                    to_MaterialDocumentItem: req.data.to_MaterialItem.map(item => ({
                        Material: item.Material,
                        Plant: item.Plant,
                        StorageLocation: item.StorageLocation,
                        GoodsMovementType: item.GoodsMovementType,
                        Supplier: item.Supplier,
                        PurchaseOrder: item.purchaseOrder,
                        PurchaseOrderItem: item.purchaseOrderItem,
                        GoodsMovementRefDocType: item.GoodsMovementRefDocType,
                        EntryUnit: item.EntryUnit,
                        QuantityInEntryUnit: item.QuantityInEntryUnit,
                    })),
                };
                //     // Post the payload to the destination
                const response = await grs.post('/A_MaterialDocumentHeader', payload);
                req.data.MaterialDocument = response.MaterialDocument;
                req.data.MaterialDocumentYear = response.MaterialDocumentYear;
                req.data.InventoryTransactionType = response.InventoryTransactionType;
                req.data.status = 'Material Document Created'
                //     return req;
            } catch (error) {
                console.error('Error while posting Material:', error.message);
                req.data.statusFlag = 'E';
                req.data.status = error.message;
                return;
            }
        });

        this.after("SAVE", Invoice, async (req) => {
            await db.run(
                UPDATE('ZSUPPLIER_INVOICEENTITY_ATTACHMENTS')
                    .set({ mimeType: 'application/pdf' })
                    .where({ up__ID: req.ID, mimeType: "application/octet-stream" }))
        });

        this.before("SAVE", Invoice, async (req) => {

            if (req.data.mode === 'email') {

                //retrieve attachments

                const dms = await cds.connect.to('DocumentStore');
                const folderResponse = await dms.get(
                    `/root?objectId=${req.data.dmsFolder}`
                );

                let attachments = [];
                for (const obj of folderResponse.objects) {
                    const objectId = obj.object.properties["cmis:objectId"].value;
                    const mimeType = obj.object.properties["cmis:contentStreamMimeType"]?.value || "application/octet-stream";
                    const filename = obj.object.properties["cmis:contentStreamFileName"]?.value || "unknown";
                    ;

                    const destination = { destinationName: 'sap_process_automation_document_store' }

                    const url = `/root?cmisselector=content&objectId=${objectId}`;
                    const getResponse = await executeHttpRequest(
                        destination,
                        {
                            url,
                            method: "GET",
                            responseType: "arraybuffer",
                        }
                    );

                    let fileBuffer;
                    fileBuffer = Buffer.from(getResponse.data);

                    if (fileBuffer) {

                        attachments.push({
                            content: fileBuffer,
                            mimeType: mimeType,
                            filename: filename,
                            folderId: req.data.dmsFolder
                        });

                        // const extractionResults = await processFileBuffer(fileBuffer, req);
                        // Creating form data
                        const form = new FormData();
                        form.append('file', fileBuffer, filename || 'file', mimeType || 'application/octet-stream');

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

                        const extractionResults = await processFileBuffer(form, req);

                    }
                }
                req.data.attachments = attachments; // NEED TO INSERT INTO DRAFTS AND DELETE FROM CURRENT DMS LOCATION.
                //


            }
            else if (!req.data.fiscalYear) {

                const allRecords = await this.run(
                    SELECT.from(Invoice.drafts)
                        .columns(cpx => {
                            cpx`*`,
                                cpx.attachments(cfy => {
                                    cfy`content`,
                                        cfy`mimeType`,
                                        cfy`folderId`,
                                        cfy`url`
                                });
                        })
                        .where({
                            ID: req.data.ID
                        })
                );

                let fileBuffer;
                if (allRecords[0].attachments[0].content) {
                    try {
                        fileBuffer = await streamToBuffer(allRecords[0].attachments[0].content);

                        // Creating form data
                        const form = new FormData();
                        form.append('file', fileBuffer, req.data.attachments[0].filename || 'file', req.data.attachments[0].mimeType || 'application/octet-stream');

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

                        const extractionResults = await processFileBuffer(form, req);
                    } catch (error) {
                        console.error('Error converting stream to Base64:', error.message);
                        req.data.statusFlag = 'E';
                        req.data.status = error.message;
                        return;
                    }

                }
            } else {
                req.data.mode = 'manual';
                // await threeWayMatch(req);
                // if (req.data.statusFlag === 'S') {
                await postInvoice(req);
                // }
            }
        });


        async function processFileBuffer(form, req) {
            try {

                let status = '';
                let extractionResults;

                // Submit document for extraction with error handling
                try {
                    const extractionResponse = await DocumentExtraction_Dest.send({
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
                            const jobStatus = await DocumentExtraction_Dest.get(`/${extractionResponse.id}`);
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
                            await updateDraftOnly(req.data.ID, status);
                            return;
                        }
                    }
                } catch (error) {
                    // status = `Document extraction failed: ${error.message}`;
                    // await updateDraftOnly(req.data.ID, status);
                    console.error('Document extraction failed:', error.message);
                    req.data.statusFlag = 'E';
                    req.data.status = error.message;
                    return;
                }

                // Map extraction results
                const headerFields = extractionResults.headerFields.reduce((acc, field) => {
                    acc[field.name] = field.value;
                    return acc;
                }, {});

                const lineItems = extractionResults.lineItems.map(item => {
                    return item.reduce((acc, field) => {
                        acc[field.name] = field.value;
                        return acc;
                    }, {});
                });

                // Populate req.data.Invoice with mapped values
                const today = new Date();
                req.data.fiscalYear = new Date(headerFields.documentDate).getFullYear().toString();
                req.data.documentCurrency_code = headerFields.currencyCode;
                req.data.documentDate = today.toISOString().split('T')[0];
                req.data.postingDate = today.toISOString().split('T')[0];
                req.data.supInvParty = 'SI4849';
                req.data.invGrossAmount = parseFloat(headerFields.grossAmount);
                req.data.companyCode = "2910";
                req.data.to_InvoiceItem = lineItems.map((lineItem, index) => ({
                    sup_InvoiceItem: (index + 1).toString().padStart(5, "0"),
                    purchaseOrder: headerFields.purchaseOrderNumber,
                    purchaseOrderItem: (index + 10).toString().padStart(5, "0"),
                    documentCurrency_code: headerFields.currencyCode,
                    supInvItemAmount: parseFloat(lineItem.netAmount),
                    poQuantityUnit: "PC",
                    quantityPOUnit: parseFloat(lineItem.quantity),
                    taxCode: "P0"
                }));
                req.data.mode = 'pdf';

                // await threeWayMatch(req);
                // if (req.data.statusFlag === 'S') {
                await postInvoice(req);
                // }
            } catch (error) {
                console.error('Error processing file buffer:', error.message);
                req.data.statusFlag = 'E';
                req.data.status = error.message;
                return;
            }
        }


        /**
         * Function to retry document extraction in case of 429 Too Many Requests
         */
        async function sendWithRetry(form, maxRetries = 5, initialDelayMs = 2000) {
            let attempts = 0;
            let delayMs = initialDelayMs;

            while (attempts < maxRetries) {
                try {
                    const response = await DocumentExtraction_Dest.send({
                        method: 'POST',
                        path: '/',
                        data: form,
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'Content-Length': form.getLengthSync()
                        }
                    });

                    return response; // Success, return the response
                } catch (error) {
                    attempts++;

                    // Check if the error is a 429 (Too Many Requests)
                    if (error.response && error.response.status === 429) {
                        console.warn(`429 Too Many Requests - Retrying in ${delayMs / 1000} seconds (Attempt ${attempts}/${maxRetries})`);
                    } else {
                        console.error(`Document extraction failed: ${error.message}`);
                        throw error; // Stop retrying for non-429 errors
                    }

                    if (attempts < maxRetries) {
                        await new Promise(resolve => setTimeout(resolve, delayMs)); // Wait before retrying
                        delayMs *= 2; // Exponential backoff (e.g., 2s, 4s, 8s, 16s...)
                    } else {
                        throw new Error(`Document extraction failed after ${maxRetries} retries.`);
                    }
                }
            }
        }


        this.on('copyInvoice', async (req) => {
            const { ID } = req.params[0];
            const originalInvoice = await db.run(
                SELECT.one.from(Invoice)
                    .columns(inv => {
                        inv`*`,                   // Select all columns from Invoice
                            inv.to_InvoiceItem(int => { int`*` }) // Select all columns from Invoice Item
                    })
                    .where({ ID: ID })
            );

            if (!originalInvoice) {
                const draftInvoice = await db.run(
                    SELECT.one.from(Invoice.drafts)
                        .columns(inv => {
                            inv`*`,                   // Select all columns from Invoice
                                inv.to_InvoiceItem(int => { int`*` }) // Select all columns from Invoice Item
                        })
                        .where({ ID: ID })
                );
                if (draftInvoice) {
                    req.error(404, 'You cannot copy a Draft Order');
                }
                else {
                    req.error(404, 'Please contact SAP IT');
                }
                if (req.errors) { req.reject(); }
            }

            const copiedInvoice = Object.assign({}, originalInvoice);
            delete copiedInvoice.ID;  // Remove the ID to ensure a new entity is created
            delete copiedInvoice.createdAt;
            delete copiedInvoice.createdBy;
            delete copiedInvoice.modifiedAt;
            delete copiedInvoice.modifiedBy;
            delete copiedInvoice.HasActiveEntity;
            delete copiedInvoice.HasDraftEntity;
            delete copiedInvoice.IsActiveEntity;
            delete copiedInvoice.newInvoice;
            delete copiedInvoice.mode
            copiedInvoice.DraftAdministrativeData_DraftUUID = cds.utils.uuid();
            // Ensure all related entities are copied
            if (originalInvoice.to_InvoiceItem) {
                copiedInvoice.to_InvoiceItem = originalInvoice.to_InvoiceItem.map(InvoiceItem => {
                    const copiedInvoiceItem = Object.assign({}, InvoiceItem);
                    delete copiedInvoiceItem.ID; // Remove the ID to create a new related entity
                    delete copiedInvoiceItem.up__ID;
                    delete copiedInvoiceItem.createdAt;
                    delete copiedInvoiceItem.createdBy;
                    delete copiedInvoiceItem.modifiedAt;
                    delete copiedInvoiceItem.modifiedBy;
                    copiedInvoiceItem.DraftAdministrativeData_DraftUUID = cds.utils.uuid();
                    return copiedInvoiceItem;
                });
            }
            //create a draft
            const oInvoice = await this.send({
                query: INSERT.into(Invoice).entries(copiedInvoice),
                event: "NEW",
            });

            //return the draft
            if (!oInvoice) {
                req.notify("Copy failed");
            }
            else {
                req.notify("Order has been successfully copied and saved as a new draft.");
            }

        });

        this.on('copyMaterial', async (req) => {
            const { ID } = req.params[0];
            const originalProduct = await db.run(
                SELECT.one.from(Product)
                    .columns(inv => {
                        inv`*`,                   // Select all columns from Product
                            inv.to_ProductItem(int => { int`*` }) // Select all columns from Product Item
                    })
                    .where({ ID: ID })
            );

            if (!originalProduct) {
                const draftProduct = await db.run(
                    SELECT.one.from(Product.drafts)
                        .columns(inv => {
                            inv`*`,                   // Select all columns from Product
                                inv.to_ProductItem(int => { int`*` }) // Select all columns from Product Item
                        })
                        .where({ ID: ID })
                );
                if (draftProduct) {
                    req.error(404, 'You cannot copy a Draft Order');
                }
                else {
                    req.error(404, 'Please contact SAP IT');
                }
                if (req.errors) { req.reject(); }
            }

            const copiedProduct = Object.assign({}, originalProduct);
            delete copiedProduct.ID;  // Remove the ID to ensure a new entity is created
            delete copiedProduct.createdAt;
            delete copiedProduct.createdBy;
            delete copiedProduct.modifiedAt;
            delete copiedProduct.modifiedBy;
            delete copiedProduct.HasActiveEntity;
            delete copiedProduct.HasDraftEntity;
            delete copiedProduct.IsActiveEntity;
            delete copiedProduct.Product;
            copiedProduct.DraftAdministrativeData_DraftUUID = cds.utils.uuid();
            // Ensure all related entities are copied
            if (originalProduct.to_ProductItem) {
                copiedProduct.to_ProductItem = originalProduct.to_ProductItem.map(ProductItem => {
                    const copiedProductItem = Object.assign({}, ProductItem);
                    delete copiedProductItem.ID; // Remove the ID to create a new related entity
                    delete copiedProductItem.up__ID;
                    delete copiedProductItem.createdAt;
                    delete copiedProductItem.createdBy;
                    delete copiedProductItem.modifiedAt;
                    delete copiedProductItem.modifiedBy;
                    delete copiedProductItem.Product;
                    copiedProductItem.DraftAdministrativeData_DraftUUID = cds.utils.uuid();
                    return copiedProductItem;
                });
            }
            //create a draft
            const oProduct = await this.send({
                query: INSERT.into(Product).entries(copiedProduct),
                event: "NEW",
            });

            //return the draft
            if (!oProduct) {
                req.notify("Copy failed");
            }
            else {
                req.notify("Order has been successfully copied and saved as a new draft.");
            }

        });


        this.on('copyProduct', async (req) => {
            const { ID } = req.params[0];
            const originalProduct = await db.run(
                SELECT.one.from(Product)
                    .columns(inv => {
                        inv`*`,  // Select all columns from Product

                            // Select all columns from ProductItem
                            inv.to_ProductItem(int => { int`*` }),

                            // Select all columns from SalesDelivery
                            inv.to_SalesDelivery(sales => { sales`*` }),

                            // Select all columns from ProductSalesTax
                            inv.to_ProductSalesTax(tax => { tax`*` }),

                            // Select all columns from ProductProcurement
                            inv.to_ProductProcurement(proc => { proc`*` })
                    })
                    .where({ ID: ID })
            );


            if (!originalProduct) {
                const draftProduct = await db.run(
                    SELECT.one.from(Product.drafts)
                        .columns(inv => {
                            inv`*`,                   // Select all columns from Product
                                inv.to_ProductItem(int => { int`*` }) // Select all columns from Product Item
                        })
                        .where({ ID: ID })
                );
                if (draftProduct) {
                    req.error(404, 'You cannot copy a Draft Order');
                }
                else {
                    req.error(404, 'Please contact SAP IT');
                }
                if (req.errors) { req.reject(); }
            }

            const copiedProduct = Object.assign({}, originalProduct);
            delete copiedProduct.ID;  // Remove the ID to ensure a new entity is created
            delete copiedProduct.createdAt;
            delete copiedProduct.createdBy;
            delete copiedProduct.modifiedAt;
            delete copiedProduct.modifiedBy;
            delete copiedProduct.HasActiveEntity;
            delete copiedProduct.HasDraftEntity;
            delete copiedProduct.IsActiveEntity;
            delete copiedProduct.Product;
            copiedProduct.DraftAdministrativeData_DraftUUID = cds.utils.uuid();
            // Ensure all related entities are copied
            if (originalProduct.to_ProductItem) {
                copiedProduct.to_ProductItem = originalProduct.to_ProductItem.map(ProductItem => {
                    const copiedProductItem = Object.assign({}, ProductItem);
                    delete copiedProductItem.ID; // Remove the ID to create a new related entity
                    delete copiedProductItem.up__ID;
                    delete copiedProductItem.createdAt;
                    delete copiedProductItem.createdBy;
                    delete copiedProductItem.modifiedAt;
                    delete copiedProductItem.modifiedBy;
                    delete copiedProductItem.Product;
                    copiedProductItem.DraftAdministrativeData_DraftUUID = cds.utils.uuid();
                    return copiedProductItem;
                });
            }
            if (originalProduct.to_SalesDelivery) {
                copiedProduct.to_SalesDelivery = originalProduct.to_SalesDelivery.map(ProductItem => {
                    const copiedProductItem = Object.assign({}, ProductItem);
                    delete copiedProductItem.ID; // Remove the ID to create a new related entity
                    delete copiedProductItem.up__ID;
                    delete copiedProductItem.createdAt;
                    delete copiedProductItem.createdBy;
                    delete copiedProductItem.modifiedAt;
                    delete copiedProductItem.modifiedBy;
                    delete copiedProductItem.Product;
                    copiedProductItem.DraftAdministrativeData_DraftUUID = cds.utils.uuid();
                    return copiedProductItem;
                });
            }
            if (originalProduct.to_ProductSalesTax) {
                copiedProduct.to_ProductSalesTax = originalProduct.to_ProductSalesTax.map(ProductItem => {
                    const copiedProductItem = Object.assign({}, ProductItem);
                    delete copiedProductItem.ID; // Remove the ID to create a new related entity
                    delete copiedProductItem.up__ID;
                    delete copiedProductItem.createdAt;
                    delete copiedProductItem.createdBy;
                    delete copiedProductItem.modifiedAt;
                    delete copiedProductItem.modifiedBy;
                    delete copiedProductItem.Product;
                    copiedProductItem.DraftAdministrativeData_DraftUUID = cds.utils.uuid();
                    return copiedProductItem;
                });
            }
            if (originalProduct.to_ProductSalesTax) {
                copiedProduct.to_ProductSalesTax = originalProduct.to_ProductSalesTax.map(ProductItem => {
                    const copiedProductItem = Object.assign({}, ProductItem);
                    delete copiedProductItem.ID; // Remove the ID to create a new related entity
                    delete copiedProductItem.up__ID;
                    delete copiedProductItem.createdAt;
                    delete copiedProductItem.createdBy;
                    delete copiedProductItem.modifiedAt;
                    delete copiedProductItem.modifiedBy;
                    delete copiedProductItem.Product;
                    copiedProductItem.DraftAdministrativeData_DraftUUID = cds.utils.uuid();
                    return copiedProductItem;
                });
            }

            if (originalProduct.to_ProductProcurement) {
                copiedProduct.to_ProductProcurement = originalProduct.to_ProductProcurement.map(ProductItem => {
                    const copiedProductItem = Object.assign({}, ProductItem);
                    delete copiedProductItem.ID; // Remove the ID to create a new related entity
                    delete copiedProductItem.up__ID;
                    delete copiedProductItem.createdAt;
                    delete copiedProductItem.createdBy;
                    delete copiedProductItem.modifiedAt;
                    delete copiedProductItem.modifiedBy;
                    delete copiedProductItem.Product;
                    copiedProductItem.DraftAdministrativeData_DraftUUID = cds.utils.uuid();
                    return copiedProductItem;
                });
            }
            //create a draft
            const oProduct = await this.send({
                query: INSERT.into(Product).entries(copiedProduct),
                event: "NEW",
            });

            //return the draft
            if (!oProduct) {
                req.notify("Copy failed");
            }
            else {
                req.notify("Order has been successfully copied and saved as a new draft.");
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

        async function updateDraftOnly(ID, status) {
            await db.run(
                UPDATE(Invoice.drafts)
                    .set({ status: status })
                    .where({ ID: ID })
            );
        }

        async function threeWayMatch(req) {
            try {
                console.log("Three-way Verification Code Check");

                let allItemsMatched = true;
                let allStatusReasons = [];

                for (const invoiceItem of req.data.to_InvoiceItem) {
                    const { purchaseOrder, purchaseOrderItem, sup_InvoiceItem, quantityPOUnit, supInvItemAmount } = invoiceItem;

                    // Fetch PO details
                    try {
                        const purchaseOrderData = await pos.run(SELECT.one.from(PurchaseOrder).where({ PurchaseOrder: purchaseOrder }));
                        if (!purchaseOrderData) {
                            allItemsMatched = false;
                            allStatusReasons.push(`Item ${sup_InvoiceItem}: Purchase Order not found`);
                            continue;
                        }
                    } catch (error) {
                        if (!purchaseOrderData) {
                            allItemsMatched = false;
                            allStatusReasons.push(`Item ${sup_InvoiceItem}: Purchase Order not found`);
                            continue;
                        }
                        console.error('PO retrieval failed:', error.message);
                        req.data.statusFlag = 'E';
                        req.data.status = error.message;
                        return;
                    }

                    try {
                        const purchaseOrderItemData = await pos.run(SELECT.one.from(PurchaseOrderItem).where({ PurchaseOrder: purchaseOrder, PurchaseOrderItem: purchaseOrderItem }));
                        if (!purchaseOrderItemData) {
                            allItemsMatched = false;
                            allStatusReasons.push(`Item ${sup_InvoiceItem}: Purchase Order Item not found`);
                            continue;
                        }
                    } catch (error) {
                        if (!purchaseOrderItemData) {
                            allItemsMatched = false;
                            allStatusReasons.push(`Item ${sup_InvoiceItem}: Purchase Order Item not found`);
                            continue;
                        }
                        console.error('PO Item retrieval failed:', error.message);
                        req.data.statusFlag = 'E';
                        req.data.status = error.message;
                        return;
                    }


                    // Fetch GR details
                    let materialDocumentData;
                    try {
                        materialDocumentData = await grs.run(
                            SELECT.one.from(A_MaterialDocumentHeader)
                                .where({ ReferenceDocument: purchaseOrder })
                        );

                    } catch (error) {
                        console.error('Material retrieval failed:', error.message);
                        req.data.statusFlag = 'E';
                        req.data.status = error.message;
                        return;
                    }

                    let materialItemData;
                    if (materialDocumentData) {
                        try {
                            materialItemData = await grs.run(
                                SELECT.one.from(A_MaterialDocumentItem)
                                    .where({
                                        MaterialDocument: materialDocumentData.MaterialDocument,
                                        MaterialDocumentYear: materialDocumentData.MaterialDocumentYear,
                                        PurchaseOrderItem: purchaseOrderItem
                                    })
                            );
                        } catch (error) {
                            console.error('Material Item retrieval failed:', error.message);
                            req.data.statusFlag = 'E';
                            req.data.status = error.message;
                            return;
                        }
                    }

                    // Determine item status
                    let itemStatus = 'Three Way Matched';
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

                    if (itemStatus !== 'Three Way Matched') {
                        allItemsMatched = false;
                        if (statusReasons.length > 0) {
                            allStatusReasons.push(`Item ${purchaseOrderItem}: ${statusReasons.join(', ')}`);
                        }
                    }
                }

                // Determine overall invoice status and update the database
                const overallStatus = allItemsMatched ? 'Three Way Matched' : 'Discrepancy';
                let statusWithReasons = overallStatus;
                let failFlag = 'S';

                if (overallStatus === 'Discrepancy') {
                    statusWithReasons += `: ${allStatusReasons.join('; ')}`;
                }
                const overallStatusFlag = overallStatus === 'Three Way Matched' ? 'S' : 'E';

                req.data.status = statusWithReasons;
                req.data.statusFlag = overallStatusFlag;

                return req;

            } catch (error) {
                req.data.status = error.message;
                req.data.statusFlag = 'E';
                console.error("Unexpected error in ThreeWayMatch:", error.message);
                return;
            }
        }


        async function postInvoice(req) {
            try {
                const {
                    fiscalYear,
                    companyCode,
                    documentDate,
                    postingDate,
                    supInvParty,
                    documentCurrency_code,
                    invGrossAmount,
                    to_InvoiceItem,
                } = req.data;

                // Prepare the payload
                const payload = {
                    FiscalYear: fiscalYear,
                    CompanyCode: companyCode,
                    DocumentDate: `/Date(${Date.now()})/`,//`/Date(${new Date(documentDate).getTime()})/`,
                    PostingDate: `/Date(${Date.now()})/`,//`/Date(${new Date(postingDate).getTime()})/`,
                    // CreationDate: `/Date(${Date.now()})/`, // Current timestamp
                    SupplierInvoiceIDByInvcgParty: supInvParty,
                    DocumentCurrency: documentCurrency_code,
                    InvoiceGrossAmount: invGrossAmount.toString(),
                    to_SuplrInvcItemPurOrdRef: to_InvoiceItem.map(item => ({
                        SupplierInvoiceItem: item.sup_InvoiceItem,
                        PurchaseOrder: item.purchaseOrder,
                        PurchaseOrderItem: item.purchaseOrderItem,
                        TaxCode: item.taxCode,
                        DocumentCurrency: item.documentCurrency_code || documentCurrency_code,
                        SupplierInvoiceItemAmount: item.supInvItemAmount.toString(),
                        PurchaseOrderQuantityUnit: item.poQuantityUnit,
                        QuantityInPurchaseOrderUnit: item.quantityPOUnit.toString(),
                    })),
                };
                // Post the payload to the destination
                const response = await invoiceDest.post('/A_SupplierInvoice', payload);
                req.data.newInvoice = response.SupplierInvoice;
                req.data.status = 'Supplier Invoice Posted';
                req.data.statusFlag = 'S';
                return req;
            } catch (error) {
                console.error('Error while posting invoice:', error.message);
                req.data.statusFlag = 'E';
                req.data.status = error.message;
                return;
            }
        }

        this.on('postInvoice', async (req) => {

            const sanitizeNumber = (value) => {
                if (typeof value === "string") {
                    return parseFloat(value.replace(/[^0-9.]/g, "")) || 0;
                }
                return value;
            };

            const documentId = new SequenceHelper({
                db: db,
                sequence: "ZSUPPLIER_DOCUMENT_ID",
                table: "zsupplier_InvoiceEntity",
                field: "documentId",
            });

            let number = await documentId.getNextNumber();
            // req.data.documentId = number.toString();

            // const today = new Date();
            const folderId = req.data.dmsFolder.replace('spa-res:cmis:folderid:', '');

            const newInvoice = {
                data: {
                    // fiscalYear: new Date(req.data.documentDate).getFullYear().toString(),
                    // documentCurrency_code: req.data.currencyCode,
                    // documentDate: today.toISOString().split('T')[0],
                    // postingDate: today.toISOString().split('T')[0],
                    // supInvParty: 'SI4849',
                    // invGrossAmount: parseFloat(sanitizeNumber(req.data.grossAmount)),
                    // companyCode: "2910", // Cleaned number
                    documentId: number.toString(),
                    dmsFolder: folderId || '',
                    // to_InvoiceItem: req.data.to_Item.map((lineItem, index) => ({
                    //     sup_InvoiceItem: (index + 1).toString().padStart(5, "0"),
                    //     purchaseOrder: req.data.purchaseOrderNumber,
                    //     purchaseOrderItem: (index + 10).toString().padStart(5, "0"),
                    //     documentCurrency_code: req.data.currencyCode,
                    //     supInvItemAmount: parseFloat(sanitizeNumber(lineItem.netAmount)), // Cleaned number
                    //     poQuantityUnit: "PC",//lineItem.unitOfMeasure,
                    //     quantityPOUnit: parseFloat(sanitizeNumber(lineItem.quantity)),
                    //     taxCode: "P0" // Cleaned number
                    // })),
                    mode: 'email',
                    DraftAdministrativeData_DraftUUID: cds.utils.uuid(),
                    IsActiveEntity: true
                }
            };


            try {
                const oInvoice = await this.send({
                    query: INSERT.into(Invoice).entries(newInvoice.data),
                    event: "NEW",
                });

                const url = `https://yk2lt6xsylvfx4dz.launchpad.cfapps.us10.hana.ondemand.com/site/Kruger#ZinvoiceMain-manage?sap-ui-app-id-hint=saas_approuter_zinvoicesmain&/Invoice(ID=${oInvoice.ID},IsActiveEntity=true)?layout=TwoColumnsMidExpanded`;

                return {
                    documentId: oInvoice.documentId,
                    invoiceNo: oInvoice.newInvoice,
                    FiscalYear: oInvoice.fiscalYear,
                    grossAmount: oInvoice.invGrossAmount,
                    message: oInvoice.status,
                    indicator: oInvoice.statusFlag,
                    url: url
                };
            } catch (error) {
                console.error("Error posting invoice:", error);
                return {
                    documentId: "",
                    invoiceNo: "",
                    FiscalYear: "",
                    grossAmount: "",
                    message: "Error posting invoice: " + error.message,
                    indicator: "E"
                };
            }


        });

        return super.init();
    }
}

module.exports = InvCatalogService;
