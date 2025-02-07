const cds = require('@sap/cds');
const SequenceHelper = require("./lib/SequenceHelper");
const FormData = require('form-data');
const { SELECT } = require('@sap/cds/lib/ql/cds-ql');
const LOG = cds.log('cat-service.js')
const axios = require("axios");
const { S3Client, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const MAX_RETRIES = 30;
const RETRY_DELAY_MS = 3000;
const { retrieveJwt, getDestination } = require("@sap-cloud-sdk/connectivity");


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
            A_MaterialDocumentItem,
            attachments,
        } = this.entities;

        const [DocumentExtraction_Dest] = await Promise.all([
            cds.connect.to('DocumentExtraction_Dest')
        ]);
        const db = await cds.connect.to("db");
        const pos = await cds.connect.to('CE_PURCHASEORDER_0001');
        const grs = await cds.connect.to('API_MATERIAL_DOCUMENT_SRV');
        const invoiceDest = await cds.connect.to('API_SUPPLIERINVOICE_PROCESS_SRV');
        const prs = await cds.connect.to('API_PRODUCT_SRV');

        this.DocumentExtraction_Dest = DocumentExtraction_Dest;

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

        this.before("SAVE", Product, async (req) => {
            try {
                // Prepare the payload
                const payload = {
                    Product: req.data.Product,
                    ProductType: req.data.ProductType,
                    GrossWeight: req.data.GrossWeight,
                    WeightUnit: req.data.WeightUnit,
                    NetWeight: req.data.NetWeight,
                    ProductGroup: req.data.ProductGroup,
                    BaseUnit: req.data.BaseUnit,
                    ItemCategoryGroup: req.data.ItemCategoryGroup,
                    IndustrySector: req.data.IndustrySector,

                    // Plant Data
                    to_Plant: {
                        results: req.data.to_Plant?.results?.map(item => ({
                            Product: req.data.Product,
                            Plant: item.Plant,
                            AvailabilityCheckType: item.AvailabilityCheckType,
                            PeriodType: item.PeriodType,
                            ProfitCenter: item.ProfitCenter,
                            MaintenanceStatusName: item.MaintenanceStatusName,
                            FiscalYearCurrentPeriod: item.FiscalYearCurrentPeriod,
                            FiscalMonthCurrentPeriod: item.FiscalMonthCurrentPeriod,
                            BaseUnit: item.BaseUnit,
                        })) || []
                    },

                    // Sales & Delivery Data
                    to_SalesDelivery: {
                        results: req.data.to_SalesDelivery?.results?.map(item => ({
                            Product: req.data.Product,
                            ProductSalesOrg: item.ProductSalesOrg,
                            ProductDistributionChnl: item.ProductDistributionChnl,
                            MinimumOrderQuantity: item.MinimumOrderQuantity,
                            SupplyingPlant: item.SupplyingPlant,
                            PriceSpecificationProductGroup: item.PriceSpecificationProductGroup,
                            AccountDetnProductGroup: item.AccountDetnProductGroup,
                            DeliveryNoteProcMinDelivQty: item.DeliveryNoteProcMinDelivQty,
                            ItemCategoryGroup: item.ItemCategoryGroup,
                            BaseUnit: item.BaseUnit,
                        })) || []
                    },

                    // Product Sales Tax Data
                    to_ProductSalesTax: {
                        results: req.data.to_ProductSalesTax?.results?.map(item => ({
                            Product: req.data.Product,
                            Country: item.Country,
                            TaxCategory: item.TaxCategory,
                            TaxClassification: item.TaxClassification,
                        })) || []
                    },

                    // Product Procurement Data (Single Entity)
                    to_ProductProcurement: {
                        Product: req.data.Product,
                        PurchaseOrderQuantityUnit: req.data.to_ProductProcurement?.PurchaseOrderQuantityUnit || "",
                        VarblPurOrdUnitStatus: req.data.to_ProductProcurement?.VarblPurOrdUnitStatus || "",
                        PurchasingAcknProfile: req.data.to_ProductProcurement?.PurchasingAcknProfile || ""
                    }
                };

                // Post the payload to the destination
                const response = await prs.post('/A_Product', payload);
                req.data.status = 'Product Created';

            } catch (error) {
                console.error('Error while posting Product:', error.message);
                req.data.statusFlag = 'E';
                req.data.status = error.message;
                req.errors(400, error.message);
                if (req.errors) { req.reject(); }
            }
        });



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
                console.error('Error while posting invoice:', error.message);
                req.data.statusFlag = 'E';
                req.data.status = error.message;
                req.errors(400, error.message);
                if (req.errors) { req.reject(); }
            }
        });

        this.before("SAVE", Invoice, async (req) => {
            if (req.data.mode === 'email') {
                const documentId = new SequenceHelper({
                    db: db,
                    sequence: "ZSUPPLIER_DOCUMENT_ID",
                    table: "zsupplier_InvoiceEntity",
                    field: "documentId",
                });

                let number = await documentId.getNextNumber();
                req.data.documentId = number.toString();
                await threeWayMatch(req);
                if (req.data.statusFlag === 'S') {
                    await postInvoice(req);
                }
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
                    } catch (error) {
                        req.error(400, "Error converting stream to Base64");
                        if (req.errors) { req.reject(); }
                    }

                    //creating form data
                    const form = new FormData();
                    try {
                        form.append('file', fileBuffer, req.data.attachments[0].filename || 'file', req.data.attachments[0].mimeType || 'application/octet-stream');
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
                                await updateDraftOnly(req.data.Invoice.ID, status);
                                return;
                            }
                        }
                    } catch (error) {
                        status = `Document extraction failed: ${error.message}`;
                        await updateDraftOnly(req.data.Invoice.ID, status);
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
                    req.data.documentDate = today.toISOString().split('T')[0];//`/Date(${Date.now()})/`;
                    req.data.postingDate = today.toISOString().split('T')[0];//`/Date(${Date.now()})/`;
                    req.data.supInvParty = 'SI4849'//headerFields.senderName.substring(0, 10); // Truncate if necessary
                    req.data.invGrossAmount = parseFloat(headerFields.grossAmount);
                    req.data.companyCode = "2910";
                    req.data.to_InvoiceItem = lineItems.map((lineItem, index) => ({
                        sup_InvoiceItem: (index + 1).toString().padStart(5, "0"),
                        purchaseOrder: headerFields.purchaseOrderNumber,
                        purchaseOrderItem: (index + 10).toString().padStart(5, "0"),
                        documentCurrency_code: headerFields.currencyCode,
                        supInvItemAmount: parseFloat(lineItem.netAmount),
                        poQuantityUnit: "PC",//lineItem.unitOfMeasure,
                        quantityPOUnit: parseFloat(lineItem.quantity),
                        taxCode: "P0"
                    }));
                    req.data.mode = 'pdf';
                    // await threeWayMatch(req);
                    // if (req.data.statusFlag === 'S') {
                    await postInvoice(req);
                    // }

                }
            } else {
                req.data.mode = 'manual'
                // await threeWayMatch(req);
                // if (req.data.statusFlag === 'S') {
                await postInvoice(req);
                // }
            }
        });

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
                    let materialDocumentData;
                    try {
                        materialDocumentData = await grs.run(
                            SELECT.one.from(A_MaterialDocumentHeader)
                                .where({ ReferenceDocument: purchaseOrder })
                        );

                    } catch (error) {
                        req.error(500, `Unexpected error: ${error.message}`);
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
                            req.error(500, `Unexpected error: ${error.message}`);
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
                return req.error(400, `Unexpected error: ${error.message}`);
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
                req.errors(400, error.message);
                if (req.errors) { req.reject(); }
            }
        }

        this.on('postInvoice', async (req) => {
            // debugger

            // // Step 1: Extract folder ID from request data
            // const DocumentStore = await cds.connect.to('DocumentStore');
            // const folderId = req.data.dmsFolder;
            // if (!folderId) {
            //     return req.error(400, "Folder ID is required.");
            // }

            // // Step 2: Define destination and DMS API details
            // const dmsDestination = "sap_process_automation_document_store"; // The destination name configured in SAP BTP cockpit
            // const folderUrl = `/browser/${folderId}`; // API endpoint for browsing folder content

            // // Step 3: Fetch the documents in the folder using DMS API
            // const dmsResponse = await cds.connect.to('DMSAPI').run({
            //     method: "GET",
            //     url: folderUrl,
            //     headers: {
            //         'Content-Type': 'application/json',
            //     }
            // });

            // if (!dmsResponse || !dmsResponse.value || dmsResponse.value.length === 0) {
            //     return req.error(404, `No documents found in the folder with ID ${folderId}`);
            // }

            // // Step 4: Extract document details
            // const documents = dmsResponse.value;
            // console.log("Retrieved Documents:", documents);

            // // Example: Process the first document
            // const firstDocument = documents[0];
            // console.log("First Document Metadata:", firstDocument);

            // // Step 5: Download the first document
            // const downloadUrl = `/browser/${folderId}/${firstDocument.Id}/content`; // API endpoint for downloading the file
            // const documentContent = await cds.connect.to('DMSAPI').run({
            //     method: "GET",
            //     url: downloadUrl,
            //     responseType: "stream", // Adjust based on the content type
            // });

            // // Save the document content or process it further
            // console.log("Document Content Retrieved:", documentContent);

            const newInvoice = {
                data: {
                    fiscalYear: new Date(req.data.documentDate).getFullYear().toString(),
                    documentCurrency_code: req.data.currencyCode,
                    documentDate: new Date(req.data.documentDate),
                    postingDate: new Date(req.data.documentDate),
                    supInvParty: req.data.senderName.substring(0, 10), // Truncate if necessary
                    invGrossAmount: parseFloat(req.data.grossAmount),
                    // comments: "Extracted from Email",
                    to_InvoiceItem: req.data.to_Item.map((lineItem, index) => ({
                        supplierInvoice: req.data.documentNumber,
                        fiscalYear: new Date(req.data.documentDate).getFullYear().toString(),
                        sup_InvoiceItem: (index + 1).toString().padStart(5, "0"),
                        purchaseOrder: req.data.purchaseOrderNumber,
                        purchaseOrderItem: (index + 1).toString().padStart(5, "0"),
                        documentCurrency_code: req.data.currencyCode,
                        supInvItemAmount: parseFloat(lineItem.netAmount),
                        poQuantityUnit: lineItem.unitOfMeasure,
                        quantityPOUnit: parseFloat(lineItem.quantity)
                    })),
                    mode: 'email',
                    DraftAdministrativeData_DraftUUID: cds.utils.uuid(),
                    IsActiveEntity: true
                }
            };

            const oInvoice = await this.send({
                query: INSERT.into(Invoice).entries(newInvoice.data),
                event: "NEW",
            });

            // const dbUpdatePayload = {
            //     DraftAdministrativeData_DraftUUID: oInvoice.DraftAdministrativeData_DraftUUID,
            //     IsActiveEntity: true
            // };


            // await db.run(
            //     UPDATE(Invoice.drafts)
            //         .set(dbUpdatePayload)
            //         .where({ ID: oInvoice.ID })
            // );

            // const entitySet = await db.run(
            //     SELECT.one.from(Invoice.drafts)
            //         .columns(cpx => {
            //             cpx`*`,
            //                 cpx.to_InvoiceItem(cfy => { cfy`*` })
            //         })
            //         .where({ ID: oInvoice.ID })
            // );

            // await INSERT(entitySet).into(Invoice);

            // await DELETE(Invoice.drafts).where({
            //     DraftAdministrativeData_DraftUUID: oInvoice.DraftAdministrativeData_DraftUUID,
            // });

        });

        // this.on('threewaymatch', 'Invoice', async req => {
        //     try {
        //         console.log("Three-way Verification Code Check");
        //         const { ID } = req.params[0];
        //         if (!ID) {
        //             return req.error(400, "Invoice ID is required");
        //         }

        //         // Fetch invoice
        //         const invoice = await db.run(SELECT.one.from(Invoice).where({ ID: ID }));
        //         if (!invoice) {
        //             return req.error(404, `Invoice with ID ${ID} not found`);
        //         }

        //         // Fetch invoice items
        //         const invoiceItems = await db.run(SELECT.from(InvoiceItem).where({ up__ID: ID }));
        //         if (!invoiceItems || invoiceItems.length === 0) {
        //             return req.error(404, `No items found for Invoice ${ID}`);
        //         }

        //         let allItemsMatched = true;
        //         let itemCounter = 1;
        //         let allStatusReasons = [];
        //         let result = {
        //             FiscalYear: "",
        //             CompanyCode: "",
        //             DocumentDate: null,
        //             PostingDate: null,
        //             SupplierInvoiceIDByInvcgParty: "",
        //             DocumentCurrency: "",
        //             InvoiceGrossAmount: invoice.invGrossAmount.toString(),
        //             status: "",
        //             to_SuplrInvcItemPurOrdRef: []
        //         };

        //         for (const invoiceItem of invoiceItems) {
        //             const { purchaseOrder, purchaseOrderItem, sup_InvoiceItem, quantityPOUnit, supInvItemAmount } = invoiceItem;

        //             // Fetch PO details
        //             const purchaseOrderData = await pos.run(SELECT.one.from(PurchaseOrder).where({ PurchaseOrder: purchaseOrder }));
        //             if (!purchaseOrderData) {
        //                 allItemsMatched = false;
        //                 allStatusReasons.push(`Item ${sup_InvoiceItem}: Purchase Order not found`);
        //                 continue;
        //             }

        //             const purchaseOrderItemData = await pos.run(SELECT.one.from(PurchaseOrderItem).where({ PurchaseOrder: purchaseOrder, PurchaseOrderItem: purchaseOrderItem }));
        //             if (!purchaseOrderItemData) {
        //                 allItemsMatched = false;
        //                 allStatusReasons.push(`Item ${sup_InvoiceItem}: Purchase Order Item not found`);
        //                 continue;
        //             }

        //             // Fetch GR details
        //             const materialDocumentData = await grs.run(
        //                 SELECT.one.from(A_MaterialDocumentHeader)
        //                     .where({ ReferenceDocument: purchaseOrder })
        //             );

        //             let materialItemData;
        //             if (materialDocumentData) {
        //                 materialItemData = await grs.run(
        //                     SELECT.one.from(A_MaterialDocumentItem)
        //                         .where({
        //                             MaterialDocument: materialDocumentData.MaterialDocument,
        //                             MaterialDocumentYear: materialDocumentData.MaterialDocumentYear,
        //                             PurchaseOrderItem: purchaseOrderItem
        //                         })
        //                 );
        //             }

        //             // Determine item status
        //             let itemStatus = 'Matched';
        //             let statusReasons = [];

        //             // Convert quantityPOUnit from string to number
        //             const quantityPOUnitNumber = Number(quantityPOUnit);

        //             // Ensure supInvItemAmount and purchaseOrderItemData.NetPriceAmount are numbers
        //             const supInvItemAmountNumber = Number(supInvItemAmount);
        //             const netPriceAmountNumber = Number(purchaseOrderItemData.NetPriceAmount);

        //             // Compare quantityPOUnit with purchaseOrderItemData.OrderQuantity
        //             if (quantityPOUnitNumber !== purchaseOrderItemData.OrderQuantity) {
        //                 itemStatus = 'Discrepancy';
        //                 statusReasons.push('Quantity mismatch with PO');
        //             }

        //             // Compare supInvItemAmount with purchaseOrderItemData.NetPriceAmount
        //             if (supInvItemAmountNumber !== netPriceAmountNumber) {
        //                 itemStatus = 'Discrepancy';
        //                 statusReasons.push('Amount mismatch with PO');
        //             }

        //             // Check if materialItemData exists and compare quantities
        //             if (!materialItemData) {
        //                 itemStatus = 'Discrepancy';
        //                 statusReasons.push('No matching Goods Receipt found');
        //             } else {
        //                 const materialQuantityNumber = Number(materialItemData.QuantityInBaseUnit);
        //                 if (quantityPOUnitNumber > materialQuantityNumber) {
        //                     itemStatus = 'Discrepancy';
        //                     statusReasons.push('Quantity mismatch with GR (Partial delivery)');
        //                 }
        //                 if (quantityPOUnitNumber < materialQuantityNumber) {
        //                     itemStatus = 'Discrepancy';
        //                     statusReasons.push('Quantity mismatch with GR (Over-delivery)');
        //                 }
        //             }

        //             if (itemStatus !== 'Matched') {
        //                 allItemsMatched = false;
        //                 if (statusReasons.length > 0) {
        //                     allStatusReasons.push(`Item ${purchaseOrderItem}: ${statusReasons.join(', ')}`);
        //                 }
        //             }

        //             // Populate result object
        //             result.FiscalYear = materialItemData ? materialItemData.ReferenceDocumentFiscalYear : "";
        //             result.CompanyCode = purchaseOrderData.CompanyCode;
        //             result.DocumentDate = materialDocumentData ? materialDocumentData.DocumentDate : null;
        //             result.PostingDate = materialDocumentData ? materialDocumentData.PostingDate : null;
        //             result.SupplierInvoiceIDByInvcgParty = purchaseOrderData.SupplierInvoiceIDByInvcgParty;
        //             result.DocumentCurrency = purchaseOrderData.DocumentCurrency;
        //             result.to_SuplrInvcItemPurOrdRef.push({
        //                 SupplierInvoice: invoiceItem.supplierInvoice,
        //                 FiscalYear: materialItemData ? materialItemData.ReferenceDocumentFiscalYear : "",
        //                 SupplierInvoiceItem: itemCounter.toString(),
        //                 PurchaseOrder: purchaseOrder,
        //                 PurchaseOrderItem: purchaseOrderItem,
        //                 ReferenceDocument: materialItemData ? materialItemData.MaterialDocument : "",
        //                 ReferenceDocumentFiscalYear: materialItemData ? materialItemData.ReferenceDocumentFiscalYear : "",
        //                 ReferenceDocumentItem: materialItemData ? materialItemData.MaterialDocumentItem : "",
        //                 TaxCode: purchaseOrderItemData.TaxCode,
        //                 DocumentCurrency: purchaseOrderItemData.DocumentCurrency,
        //                 SupplierInvoiceItemAmount: supInvItemAmount.toString(),
        //                 PurchaseOrderQuantityUnit: purchaseOrderItemData.PurchaseOrderQuantityUnit,
        //                 QuantityInPurchaseOrderUnit: purchaseOrderItemData.OrderQuantity.toString(),
        //             });

        //             itemCounter += 1;
        //         }

        //         // Determine overall invoice status and update the database
        //         const overallStatus = allItemsMatched ? 'Matched' : 'Discrepancy';
        //         let statusWithReasons = overallStatus;
        //         let failFlag = 'S';

        //         if (overallStatus === 'Discrepancy') {
        //             statusWithReasons += `: ${allStatusReasons.join('; ')}`;
        //         }
        //         const overallStatusFlag = failFlag ? 'E' : 'S';
        //         await db.run(UPDATE(Invoice).set({ status: statusWithReasons, statusFlag: overallStatusFlag }).where({ ID: ID }));

        //         // Set the status in the result object
        //         result.status = statusWithReasons;

        //         // Send response
        //         return req.reply(result);

        //     } catch (error) {
        //         console.error("Unexpected error in ThreeWayMatch:", error);
        //         return req.error(500, `Unexpected error: ${error.message}`);//COMMENT
        //     }
        // });

        return super.init();
    }
}

module.exports = InvCatalogService;
