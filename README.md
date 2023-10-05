## Next Api Handler

Easy to use ExpressJS like api handler for Next Api Routes

### Install Project Dependencies

```bash
npm i qs @types/qs
```

## Request Handler

```ts
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
      let message = "Internal Server Error";
      let statusCode = 500;
      if (err instanceof Error) {
        message = err.message || message;
      }
      if (err instanceof CustomError) {
        statusCode = err.statusCode || statusCode;
        message = err.message;
      }
      this.#res = NextResponse.json({ message }, { status: statusCode });
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
```

## Types

```ts
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

export type CustomRequestHandler<Params = any, ReqBody = any, Query = any> = (
  req: CustomRequest<Params, ReqBody, Query>,
  res: typeof NextResponse,
  next: () => Promise<void>
) => any;
```

### Api Route /api/hello/:id

```ts
import CustomError from "@/lib/customError";
import RequestHandler from "@/lib/requestHandler";
import { CustomRequestHandler, NextRequestHandler } from "@/types/api";

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

const thirdMiddleware: CustomRequestHandler<
  { id: string },
  { email: string; password: string },
  { search: string }
> = (req, res) => {
  console.log("third middleware");
  return res.json({
    body: req.parsedBody,
    paramsId: req.params.id,
    parsedQuery: req.query,
  });
};

export const GET: NextRequestHandler = async (req, ctx) => {
  const handler = new RequestHandler<{ id: string }>(req, ctx);
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
```

## Custom Error

```ts
/**
 * Custom Error can be used to throw error with `message` and `statusCode`
 */
class CustomError {
  constructor(public message: string, public statusCode?: number) {
    this.message = message;
    this.statusCode = statusCode || 500;
  }
}
export default CustomError;
```
