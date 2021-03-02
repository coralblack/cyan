import { PageModel } from "src/model/Page.model";
import { Inject } from "../../../dist/core";

interface page {
  id?: string;
  category: string;
  chapter: string;
  part?: string;
  page?: string;
}

export interface GetPagesResponse {
	page: string;
	rpp: string;
	count: string;
	items: page[];
}

export class PageService {
  constructor(
    @Inject() private readonly pageModel: PageModel
  ) {}

  createPageEntity(category: string, chapter: string, part: string, page: number) {
    return {
      id: undefined,
      category,
      chapter,
      part,
      page,
    };
  }

  async setup() {
    const pages = [
      this.createPageEntity('C1', 'CH1', 'P1', 1),
      this.createPageEntity('C1', 'CH1', 'P1', 2),
      this.createPageEntity('C1', 'CH1', 'P2', 1),
      this.createPageEntity('C1', 'CH2', 'P1', 1),
      this.createPageEntity('C2', 'CH1', 'P1', 1),
      this.createPageEntity('C2', 'CH2', 'P1', 1),
      this.createPageEntity('C2', 'CH2', 'P2', 1),
    ];

    const exist = await this.pageModel.findOne({});

    if (exist) return;

    for(let i = 0; i < pages.length; i += 1) {
      await this.pageModel.insert(pages[i]);
    }
  }

  async getPaginatablePages(rpp: number = 10, page: number = 1): Promise<GetPagesResponse> {
    const data = await this.pageModel.getPaginatableItems({rpp, page});

    return {
      page: String(data.page),
      rpp: String(data.rpp),
      count: String(data.count),
      items: data.items.map(item => ({
        id: String(item.id),
        category: item.category,
        chapter: item.chapter,
        part: item.part,
        page: String(item.page),
      }))
    };
  }

  async getPaginatableParts(rpp: number = 10, page: number = 1): Promise<GetPagesResponse> {
    const data = await this.pageModel.getPaginatableItems({
      rpp,
      page,
      groupBy: ["category", "chapter", "part"],
    });

    return {
      page: String(data.page),
      rpp: String(data.rpp),
      count: String(data.count),
      items: data.items.map(item => ({
        category: item.category,
        chapter: item.chapter,
        part: item.part,
      }))
    };
  }

  async getPaginatableChapters(rpp: number = 10, page: number = 1): Promise<GetPagesResponse> {
    const data = await this.pageModel.getPaginatableItems({
      rpp,
      page,
      groupBy: ["category", "chapter"],
    });

    return {
      page: String(data.page),
      rpp: String(data.rpp),
      count: String(data.count),
      items: data.items.map(item => ({
        category: item.category,
        chapter: item.chapter,
      }))
    };
  }

  async getPaginatableChapterPageSummary(rpp: number = 10, page: number = 1): Promise<GetPagesResponse> {
    const data = await this.pageModel.getPaginatableItems({
      rpp,
      page,
      select: {
        column: ["category", "chapter"],
        sum: ["page"],
      },
      groupBy: ["category", "chapter"],
    });

    return {
      page: String(data.page),
      rpp: String(data.rpp),
      count: String(data.count),
      items: data.items.map(item => ({
        category: item.category,
        chapter: item.chapter,
        page: String(item.page),
      }))
    };
  }
}