import axios from "axios";

export class AffixClient {
  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string
  ) {}

  private get headers() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json"
    };
  }

  eligibilityCheck(body: unknown) {
    return axios.post(`${this.baseUrl}/api/eligibility/check`, body, { headers: this.headers }).then((r) => r.data);
  }

  eligibilityComposite(body: unknown) {
    return axios.post(`${this.baseUrl}/api/eligibility/composite`, body, { headers: this.headers }).then((r) => r.data);
  }

  generateToken(body: unknown) {
    return axios.post(`${this.baseUrl}/api/tokens/generate`, body, { headers: this.headers }).then((r) => r.data);
  }

  validateToken(body: unknown) {
    return axios.post(`${this.baseUrl}/api/tokens/validate`, body, { headers: this.headers }).then((r) => r.data);
  }

  generateProof(body: unknown) {
    return axios.post(`${this.baseUrl}/api/proof/generate`, body, { headers: this.headers }).then((r) => r.data);
  }

  auditProof(body: unknown) {
    return axios.post(`${this.baseUrl}/api/audit/zkp-proof`, body, { headers: this.headers }).then((r) => r.data);
  }
}
