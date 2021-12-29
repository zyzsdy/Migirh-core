import * as Koa from 'koa';
import { checkLogin } from '../functions/checkLogin';
import checkRequest from '../functions/checkRequest';
import { getConnection, getManager } from 'typeorm';
import { CheckAuthGlobal, CheckAuthScope } from '../functions/checkAuth';
import Category from '../models/Category';
import Task from '../models/Task';

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

    if (jsonRequest.cate_id.toLowerCase() === "default") {
        ctx.basicResponse.BadRequest({info: "CategoryIdCannotSetDefault"});
        return;
    }

    let auth = await CheckAuthScope(user, "TaskAdd", jsonRequest.default_path);

    if (!auth) {
        ctx.basicResponse.Forbidden();
        return;
    }

    const cateDb = getManager().getRepository(Category);
    const cateItem = cateDb.create(jsonRequest);

    await cateDb.save(cateItem);
    ctx.basicResponse.OK();
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

export async function editCategory(ctx: Koa.ParameterizedContext) {
    let user = await checkLogin(ctx);
    if (user == null) return;

    if (checkRequest(ctx, {
        "cate_id": "Category Id"
    })) return;

    let jsonRequest = ctx.jsonRequest as CategoryAddRequest;

    if (jsonRequest.cate_id.toLowerCase() === "default") {
        ctx.basicResponse.BadRequest({info: "CategoryIdCannotSetDefault"});
        return;
    }

    let auth = await CheckAuthScope(user, "TaskAdd", jsonRequest.default_path);

    if (!auth) {
        ctx.basicResponse.Forbidden();
        return;
    }

    const cateDb = getManager().getRepository(Category);
    const cateItem = cateDb.create(jsonRequest);

    await cateDb.save(cateItem);
    ctx.basicResponse.OK();
}

interface CategoryIdRequest {
    cate_id: string;
}

export async function deleteCategory(ctx: Koa.ParameterizedContext) {
    let user = await checkLogin(ctx);
    if (user == null) return;

    if (checkRequest(ctx, {
        "cate_id": "Category Id"
    })) return;

    let jsonRequest = ctx.jsonRequest as CategoryIdRequest;

    if (jsonRequest.cate_id.toLowerCase() === "default") {
        ctx.basicResponse.BadRequest({info: "CannotDeleteDefaultCategory"});
        return;
    }

    const cateDb = getManager().getRepository(Category);
    const cate = await cateDb.findOne(jsonRequest.cate_id);

    if (cate.default_path) {
        let auth = await CheckAuthScope(user, "TaskAdd", cate.default_path);
        if (!auth) {
            ctx.basicResponse.Forbidden();
            return;
        }
    } else {
        let auth = await CheckAuthGlobal(user, "TaskInput");
        if (!auth) {
            ctx.basicResponse.Forbidden();
            return;
        }
    }

    //修改所有category为此cate_id的Task为Default
    await getConnection().createQueryBuilder().update(Task)
        .set({
            category: "Default",
            date_update: new Date()
        })
        .where("category = :cate_id", {cate_id: jsonRequest.cate_id})
        .execute();

    //删除此cate
    await cateDb.delete(cate);

    ctx.basicResponse.OK();
}