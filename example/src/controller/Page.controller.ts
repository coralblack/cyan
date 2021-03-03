import { GetPagesResponse, PageService } from "src/service/Page.service";
import { Inject } from "../../../dist/core";
import { Get, Post, QueryParam } from "../../../dist/router";
import { BaseController } from "./Base.controller";

export class PageController extends BaseController {
	constructor(
		@Inject() private readonly pageServcie: PageService
	) { super(); }

	@Post("/page/setup")
	async setup() {
		await this.pageServcie.setup();

		return true;
	}

	@Get("/page/pages")
	async getPages(
		@QueryParam("rpp") rpp: number,
		@QueryParam("page") page: number,
	): Promise<GetPagesResponse> {
		const res = await this.pageServcie.getPaginatablePages(rpp, page);

		return res;
	}

	@Get("/page/parts")
	async getParts(
		@QueryParam("rpp") rpp: number,
		@QueryParam("page") page: number,
	): Promise<GetPagesResponse> {
		const res = await this.pageServcie.getPaginatableParts(rpp, page);

		return res;
	}

	@Get("/page/chapters")
	async getChapters(
		@QueryParam("rpp") rpp: number,
		@QueryParam("page") page: number,
	): Promise<GetPagesResponse> {
		const res = await this.pageServcie.getPaginatableChapters(rpp, page);

		return res;
	}
}
