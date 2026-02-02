import * as tls from 'tls';

export interface SslCertificateInfo {
  valid: boolean;
  expiresAt?: string; // ISO date
  issuer?: string;
  subject?: string;
  daysUntilExpiry?: number;
  raw?: unknown;
}

export interface SslAdapter {
  getCertificateInfo: (hostname: string) => Promise<SslCertificateInfo>;
}

export function createSslAdapter(): SslAdapter {
  return {
    async getCertificateInfo(hostname: string): Promise<SslCertificateInfo> {
      return new Promise((resolve) => {
        const socket = tls.connect(
          {
            host: hostname,
            port: 443,
            servername: hostname, // SNI
            rejectUnauthorized: false, // We want to check validity ourselves
          },
          () => {
            try {
              const cert = socket.getPeerCertificate();

              if (!cert || Object.keys(cert).length === 0) {
                socket.end();
                resolve({
                  valid: false,
                  raw: { error: 'No certificate found' },
                });
                return;
              }

              const authorized = socket.authorized;
              const validTo = cert.valid_to ? new Date(cert.valid_to) : null;
              const validFrom = cert.valid_from ? new Date(cert.valid_from) : null;
              const now = new Date();

              // Check if certificate is valid
              const isDateValid =
                validTo &&
                validFrom &&
                now >= validFrom &&
                now <= validTo;

              // Calculate days until expiry
              let daysUntilExpiry: number | undefined;
              if (validTo) {
                daysUntilExpiry = Math.floor(
                  (validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                );
              }

              // Get issuer info
              const issuerParts: string[] = [];
              if (cert.issuer) {
                if (cert.issuer.O) issuerParts.push(cert.issuer.O);
                if (cert.issuer.CN) issuerParts.push(cert.issuer.CN);
              }

              // Get subject info
              const subjectParts: string[] = [];
              if (cert.subject) {
                if (cert.subject.O) subjectParts.push(cert.subject.O);
                if (cert.subject.CN) subjectParts.push(cert.subject.CN);
              }

              socket.end();

              resolve({
                valid: authorized && Boolean(isDateValid),
                expiresAt: validTo?.toISOString(),
                issuer: issuerParts.join(' - ') || undefined,
                subject: subjectParts.join(' - ') || undefined,
                daysUntilExpiry,
                raw: {
                  authorized,
                  validFrom: validFrom?.toISOString(),
                  validTo: validTo?.toISOString(),
                  fingerprint: cert.fingerprint,
                  serialNumber: cert.serialNumber,
                },
              });
            } catch (error) {
              socket.end();
              resolve({
                valid: false,
                raw: { error: error instanceof Error ? error.message : 'Unknown error' },
              });
            }
          }
        );

        socket.on('error', (error) => {
          resolve({
            valid: false,
            raw: { error: error.message },
          });
        });

        // Timeout after 10 seconds
        socket.setTimeout(10000, () => {
          socket.destroy();
          resolve({
            valid: false,
            raw: { error: 'Connection timeout' },
          });
        });
      });
    },
  };
}
