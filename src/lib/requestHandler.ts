import qs from "qs";
import { CustomRequest, CustomRequestHandler } from "@/types/api";
import { NextRequest, NextResponse } from "next/server";
import CustomError from "./customError";

class RequestHandler<Params = any, ReqBody = any, Query = any> {
  #index = 0;
  #res = undefined as NextResponse | undefined;
  #req = {} as CustomRequest<Params, ReqBody, Query>;
  #handlers = [] as CustomRequestHandler<Params, ReqBody, Query>[];

  constructor(req: NextRequest, ctx?: { params: Params }) {
    this.#req = req as CustomRequest<Params, ReqBody, Query>;
    this.#req.params = (ctx?.params || {}) as Params;
    this.#req.parsedBody = {} as ReqBody;
    const query = decodeSearchParams(req.url);
    this.#req.query = query as Query;
  }

  use(...handlers: CustomRequestHandler<Params, ReqBody, Query>[]) {
    this.#handlers = [...this.#handlers, ...handlers];
  }

  async response(): Promise<NextResponse> {
    await this.#run();
    return (
      this.#res ||
      NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
    );
  }

  async #run() {
    const body = await parseBody<ReqBody>(this.#req);
    this.#req.parsedBody = body as ReqBody;
    try {
      const next = async () => {
        this.#index++;
        const nextHandler = this.#handlers[this.#index];
        if (nextHandler !== undefined) {
          const res = await nextHandler(this.#req, NextResponse, next);
          if (res) this.#res = res;
        }
      };

      const handler = this.#handlers[0];
      if (handler !== undefined) {
        const res = await handler(this.#req, NextResponse, next);
        if (res) this.#res = res;
      }
    } catch (err: unknown) {
      this.#res = handleError(err);
    }
  }
}
export default RequestHandler;

async function parseBody<Body = unknown>(req: NextRequest): Promise<Body> {
  try {
    const body = await req.json();
    return body;
  } catch (error) {
    return {} as Body;
  }
}

function decodeSearchParams<Query = unknown>(url: string): Query {
  const { search } = new URL(url);
  const query = qs.parse(search.substring(1));
  return query as Query;
}

function handleError(err: unknown): NextResponse {
  let message = "Internal Server Error";
  let statusCode = 500;
  if (err instanceof Error) {
    message = err.message || message;
  }
  if (err instanceof CustomError) {
    statusCode = err.statusCode || statusCode;
  }
  return NextResponse.json({ message }, { status: statusCode });
}
