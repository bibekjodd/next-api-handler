import { NextRequest, NextResponse } from "next/server";

export type NextRequestHandler = (req: NextRequest, ctx: { params: {} }) => any;

export type CustomRequest<
  Params = unknown,
  Body = unknown,
  Query = unknown
> = NextRequest & {
  params: Params;
  parsedBody: Body;
};

export type CustomRequestHandler<Params = unknown, Body = unknown> = (
  req: CustomRequest<Params, Body, Query>,
  next: (err?: unknown) => Promise<void>
) => any;
