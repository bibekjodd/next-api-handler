import { NextRequest, NextResponse } from "next/server";

export type NextRequestHandler = (req: NextRequest, ctx: { params: {} }) => any;

export type CustomRequest<
  Params = any,
  ReqBody = any,
  Query = any
> = NextRequest & {
  params: Params;
  parsedBody: ReqBody;
  query: Query;
};

export type CustomRequestHandler<Params = any, ReqBody = any, Query = any> = (
  req: CustomRequest<Params, ReqBody, Query>,
  res: typeof NextResponse,
  next: () => Promise<void>
) => any;
