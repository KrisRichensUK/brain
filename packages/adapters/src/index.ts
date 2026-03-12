import fs from "node:fs/promises";
import axios from "axios";
import { parse } from "csv-parse/sync";
import { XMLParser } from "fast-xml-parser";
import pdf from "pdf-parse";
import { Client } from "pg";

export type FetchInput = { identifier: string; venueId: string; timestamp: string };

export type SourceConfig =
  | { type: "postgres"; connectionString: string; query: string }
  | { type: "rest"; url: string; method: "GET" | "POST"; headers?: Record<string, string> }
  | { type: "csv"; path: string; keyColumn: string }
  | { type: "json"; path: string }
  | { type: "xml"; path: string }
  | { type: "pdf"; path: string };

export interface SourceAdapter {
  supports(source: SourceConfig): boolean;
  fetch(source: SourceConfig, input: FetchInput): Promise<Record<string, unknown> | null>;
}

export class PostgresAdapter implements SourceAdapter {
  supports(source: SourceConfig): boolean {
    return source.type === "postgres";
  }

  async fetch(source: SourceConfig, input: FetchInput) {
    if (source.type !== "postgres") return null;
    const client = new Client({ connectionString: source.connectionString });
    await client.connect();
    try {
      const result = await client.query(source.query, [input.identifier]);
      return (result.rows[0] as Record<string, unknown> | undefined) ?? null;
    } finally {
      await client.end();
    }
  }
}

export class RestAdapter implements SourceAdapter {
  supports(source: SourceConfig): boolean { return source.type === "rest"; }

  async fetch(source: SourceConfig, input: FetchInput) {
    if (source.type !== "rest") return null;
    if (source.method === "GET") {
      const { data } = await axios.get(source.url.replace("{identifier}", encodeURIComponent(input.identifier)), { headers: source.headers });
      return data;
    }
    const { data } = await axios.post(source.url, input, { headers: source.headers });
    return data;
  }
}

export class CsvAdapter implements SourceAdapter {
  supports(source: SourceConfig): boolean { return source.type === "csv"; }

  async fetch(source: SourceConfig, input: FetchInput) {
    if (source.type !== "csv") return null;
    const raw = await fs.readFile(source.path, "utf8");
    const rows = parse(raw, { columns: true, skip_empty_lines: true }) as Record<string, string>[];
    return rows.find((r) => String(r[source.keyColumn]) === input.identifier) ?? null;
  }
}

export class FileAdapter implements SourceAdapter {
  supports(source: SourceConfig): boolean {
    return ["json", "xml", "pdf"].includes(source.type);
  }

  async fetch(source: SourceConfig, input: FetchInput) {
    if (source.type === "json") {
      const raw = await fs.readFile(source.path, "utf8");
      return JSON.parse(raw) as Record<string, unknown>;
    }
    if (source.type === "xml") {
      const raw = await fs.readFile(source.path, "utf8");
      const parser = new XMLParser();
      return parser.parse(raw) as Record<string, unknown>;
    }
    if (source.type === "pdf") {
      const raw = await fs.readFile(source.path);
      const data = await pdf(raw);
      return {
        containsIdentifier: data.text.includes(input.identifier),
        text: data.text
      };
    }
    return null;
  }
}

export const defaultAdapters: SourceAdapter[] = [
  new PostgresAdapter(),
  new RestAdapter(),
  new CsvAdapter(),
  new FileAdapter()
];
