import CustomError from "@/lib/customError";
import RequestHandler from "@/lib/requestHandler";
import { CustomRequestHandler, NextRequestHandler } from "@/types/api";

type Params = {
  id: string;
};

type ReqBody = Partial<{
  email: string;
  password: string;
}>;

type Query = Partial<{
  search: string;
}>;

type ResBody = {
  body: ReqBody;
  paramsId: string;
  parsedQuery: Query;
};

const firstMiddleware: CustomRequestHandler = async (req, res, next) => {
  console.log("first middleware");
  const start = Date.now();
  await next();
  console.log(`Request completed in ${Date.now() - start}ms`);
};

const secondMiddleware: CustomRequestHandler = async (req, res, next) => {
  if (Math.random() > 0.5) {
    throw new CustomError(
      "Randomly thrown custom error. Don't worry it is self handled",
      400
    );
  }
  console.log("second middleware");
  await next();
};

const thirdMiddleware: CustomRequestHandler<Params, ResBody, ReqBody, Query> = (
  req,
  res
) => {
  console.log("third middleware");
  return res.json({
    body: req.parsedBody,
    paramsId: req.params.id,
    parsedQuery: req.query,
  });
};

export const GET: NextRequestHandler = async (req, ctx) => {
  const handler = new RequestHandler<Params, ResBody, ReqBody, Query>(req, ctx);
  handler.use(firstMiddleware, secondMiddleware, thirdMiddleware);
  return handler.response();
};

export const POST: NextRequestHandler = async (req, ctx) => {
  const handler = new RequestHandler(req, ctx);
  handler.use(firstMiddleware);
  handler.use(secondMiddleware);
  handler.use(thirdMiddleware);
  return handler.response();
};
