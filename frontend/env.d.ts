interface ImportMetaEnv {
  readonly VITE_PUBLIC_FILE_SERVER: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace NodeJS {
  interface ProcessEnv {
    readonly ADMIN: string;
    readonly API: string;
    readonly FILE_SERVER: string;
    readonly API_KEY: string;
  }
}
