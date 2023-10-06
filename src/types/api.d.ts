import { NextRequest, NextResponse } from "next/server";

export type NextRequestHandler<Params = any> = (
  req: NextRequest,
  ctx: { params: Params }
) => any;

export type CustomRequest<
  Params = any,
  ReqBody = any,
  Query = any
> = NextRequest & {
  params: Params;
  parsedBody: ReqBody;
  query: Query;
};

export type CustomRequestHandler<
  Params = any,
  ResBody = any,
  ReqBody = any,
  Query = any
> = (
  req: CustomRequest<Params, ReqBody, Query>,
  res: typeof NextResponse,
  next: () => Promise<void>
) =>
  | NextResponse<ResBody>
  | Promise<NextResponse<ResBody> | void | undefined>
  | void
  | undefined;
