import Log from "sap/base/Log";
import MessageBox from "sap/m/MessageBox";
import MessageToast from "sap/m/MessageToast";
import Controller from "sap/ui/core/mvc/Controller";
import cursorPos from "sap/ui/dom/jquery/cursorPos";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import JSONModel from "sap/ui/model/json/JSONModel";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import AppComponent from "../Component";
import NorthwindService from "../service/NorthwindService";

/**
 * @namespace be.wl.TypeScriptServiceDemoApp.controller
 */
export default class AppController extends Controller {

	private northwindService: NorthwindService;

	public onInit(): void {

		var oViewModel = new JSONModel({
			progress: 10
		});
		this.getView().setModel(oViewModel, "view");
		// apply content density mode to root view
		this.getView().addStyleClass((this.getOwnerComponent() as AppComponent).getContentDensityClass());
		this.northwindService = new NorthwindService((this.getOwnerComponent().getModel() as ODataModel));
		this.runActions();
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
			MessageToast.show("Suppliers in Redmond:" + suppliers.data.results.length);

			const response = await this.northwindService.getSuppliers();
			model.setProperty("/progress", 100);
			this.getView().setModel(new JSONModel({
				Suppliers: response.data.results
			}), "nw");
		} catch (error) {
			Log.error("This should never have happened");
		}
	}

	public sayHello(): void {
		MessageBox.show("Hello World!");
	}
}