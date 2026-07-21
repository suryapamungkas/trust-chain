// =====================================================================
// TrustChain UMKM — Environment Variable Validation
// Validates required env vars at startup
// =====================================================================

interface EnvRequirement {
  key: string;
  required: boolean;
  description: string;
  defaultValue?: string;
}

const ENV_REQUIREMENTS: EnvRequirement[] = [
  { key: "JWT_SECRET", required: true, description: "Secret key for JWT signing. Must be at least 32 characters." },
  { key: "DB_HOST", required: true, description: "MySQL database host", defaultValue: "localhost" },
  { key: "DB_USER", required: true, description: "MySQL database user", defaultValue: "root" },
  { key: "DB_PASSWORD", required: true, description: "MySQL database password" },
  { key: "DB_NAME", required: true, description: "MySQL database name", defaultValue: "trustchain_umkm" },
  { key: "WALLET_ENCRYPTION_KEY", required: false, description: "AES-256 key for encrypting wallet private keys. Strongly recommended for production." },
];

export function validateEnv(): { valid: boolean; warnings: string[]; errors: string[] } {
  const warnings: string[] = [];
  const errors: string[] = [];

  for (const req of ENV_REQUIREMENTS) {
    const value = process.env[req.key];

    if (!value && req.required && !req.defaultValue) {
      errors.push(`❌ Missing required env var: ${req.key} — ${req.description}`);
    } else if (!value && req.defaultValue) {
      warnings.push(`⚠️  ${req.key} not set, using default: "${req.defaultValue}"`);
    } else if (!value && !req.required) {
      warnings.push(`ℹ️  Optional env var not set: ${req.key} — ${req.description}`);
    }
  }

  // Validate JWT_SECRET strength
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret && jwtSecret.length < 32) {
    warnings.push("⚠️  JWT_SECRET is shorter than 32 characters. Consider using a longer secret.");
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
  };
}

/**
 * Run validation and log results. Call this at app startup.
 */
export function checkEnvOnStartup(): void {
  const { valid, warnings, errors } = validateEnv();

  if (warnings.length > 0) {
    console.warn("\n🔧 TrustChain UMKM — Environment Warnings:");
    warnings.forEach((w) => console.warn(`   ${w}`));
  }

  if (!valid) {
    console.error("\n🚨 TrustChain UMKM — Environment Errors:");
    errors.forEach((e) => console.error(`   ${e}`));
    console.error("\n   Please set the required environment variables in .env.local\n");
    // In production, you might want to throw here. For demo, we just warn.
  }

  if (valid && warnings.length === 0) {
    console.log("✅ TrustChain UMKM — All environment variables validated.");
  }
}
