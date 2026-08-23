// `midtrans-client` ships no TypeScript types. This declares only the surface
// this codebase actually calls, verified against the installed package's
// source (node_modules/midtrans-client/lib/snap.js, apiConfig.js) rather than
// assumed from training data.
declare module "midtrans-client" {
  export interface SnapClientOptions {
    isProduction: boolean;
    serverKey: string;
    clientKey: string;
  }

  export interface SnapTransactionResponse {
    token: string;
    redirect_url: string;
  }

  export class Snap {
    constructor(options: SnapClientOptions);
    createTransaction(parameter: Record<string, unknown>): Promise<SnapTransactionResponse>;
  }

  const midtransClient: { Snap: typeof Snap };
  export default midtransClient;
}
