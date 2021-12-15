import BaseController from "./BaseController";
import Log from "sap/base/Log";
import MessageToast from "sap/m/MessageToast";
import Event from "sap/ui/base/Event";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import JSONModel from "sap/ui/model/json/JSONModel";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import NorthwindService, { SuppliersEntity } from "../service/NorthwindService";

/**
 * @namespace be.wl.TypeScriptServiceDemoApp.controller
 */
export default class AppController extends BaseController {

	private northwindService: NorthwindService;

	public onInit(): void {
		const oViewModel = new JSONModel({
			progress: 10
		});
		this.getView().setModel(oViewModel, "view");
		// apply content density mode to root view
		this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());


		this.northwindService = new NorthwindService((this.getOwnerComponent().getModel() as ODataModel));
		void this.runActions();
	}

	public async runActions(): Promise<void> {
		const model = (this.getView().getModel("view") as JSONModel);
		const filters = [new Filter("Address/City", FilterOperator.EQ, "Redmond")];
		try {
			await (this.getOwnerComponent().getModel() as ODataModel).metadataLoaded();
			try {
				const supplier = await this.northwindService.getSupplierById(20);
				model.setProperty("/progress", 30);
				MessageToast.show("Company name of the first Supplier:" + supplier.data.Name);
			} catch (error) {
				MessageToast.show("Supplier with ID 20 does not exist");
			}
			const suppliers = await this.northwindService.getSuppliersWithFilter(filters);
			model.setProperty("/progress", 70);
			MessageToast.show(`Suppliers in Redmond: ${suppliers.data.results.length}`);

			const response = await this.northwindService.getSuppliers();
			model.setProperty("/progress", 100);
			this.getView().setModel(new JSONModel({
				Suppliers: response.data.results
			}), "nw");
		} catch (error) {
			Log.error("This should never have happened");
		}
	}
	public async generateNewSupplier(event:Event): Promise<void> {
		const model = (this.getView().getModel("view") as JSONModel);
		const newSupplier: SuppliersEntity = {
			ID:0,
			Name: `Test ${new Date().getTime()}`,
			Concurrency:1,
			Address: {
				Street: "TestStreet",
				City: "TestCity",
				State: "TestState",
				ZipCode: "TestZip",
				Country: "Belgium"
			}
		};
		try {
			model.setProperty("/progress", 20);
			newSupplier.ID = await this.northwindService.getSupplierNextID();
			model.setProperty("/progress", 40);
			const response = await this.northwindService.createSupplier(newSupplier);
			model.setProperty("/progress", 60);
			MessageToast.show(`Supplier ${response.data.Name} created!`);
		} catch (error) {
			MessageToast.show("Error when creating Suppliers!");
		}
		const response = await this.northwindService.getSuppliers();
		model.setProperty("/progress", 80);
		this.getView().setModel(new JSONModel({
			Suppliers: response.data.results
		}), "nw");
		model.setProperty("/progress", 100);
	}
}