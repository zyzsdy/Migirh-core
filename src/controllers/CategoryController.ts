import * as Koa from 'koa';
import { checkLogin } from '../functions/checkLogin';
import checkRequest from '../functions/checkRequest';
import { getManager } from 'typeorm';
import { CheckAuthScope } from '../functions/checkAuth';
import Category from '../models/Category';

interface CategoryAddRequest {
    cate_id: string;
    cate_name?: string;
    default_path?: string;
}

export async function addCategory(ctx: Koa.ParameterizedContext) {
    let user = await checkLogin(ctx);
    if (user == null) return;

    if (checkRequest(ctx, {
        "cate_id": "Category Id"
    })) return;

    let jsonRequest = ctx.jsonRequest as CategoryAddRequest;
    let auth = await CheckAuthScope(user, "TaskAdd", jsonRequest.default_path);

    if (!auth) {
        ctx.basicResponse.Forbidden();
        return;
    }

    const cateDb = getManager().getRepository(Category);
    const cateItem = cateDb.create(jsonRequest);

    await cateDb.save(cateItem);
    await ctx.basicResponse.OK();
}

export async function getCategory(ctx: Koa.ParameterizedContext) {
    let user = await checkLogin(ctx);
    if (user == null) return;

    const cateDb = getManager().getRepository(Category);
    const cateList = await cateDb.find();

    const defaultCate: Category = {
        cate_id: "Default",
        cate_name: null,
        default_path: null
    };

    ctx.basicResponse.OK({
        data: [...cateList, defaultCate]
    });
}