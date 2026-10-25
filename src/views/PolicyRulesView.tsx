import React from 'react';

export const PolicyRulesView: React.FC = () => {
  const rules = [
    { id: 'R-01', system: 'PostgreSQL 15', category: 'User Core Credentials', treatment: 'DELETE', retention: '0 days', basis: 'GDPR Art. 17' },
    { id: 'R-02', system: 'PostgreSQL 15', category: 'User Profile Attributes', treatment: 'DELETE', retention: '0 days', basis: 'GDPR Art. 17' },
    { id: 'R-03', system: 'PostgreSQL 15', category: 'Financial Billing History', treatment: 'RETAIN', retention: '7 Years (2,555d)', basis: 'FinTech Compliance' },
    { id: 'R-04', system: 'Elasticsearch v8.9', category: 'Search Document PII', treatment: 'DELETE', retention: '0 days', basis: 'GDPR Art. 17' },
    { id: 'R-05', system: 'Redis Cluster', category: 'Session Tokens & RAM Keys', treatment: 'DELETE', retention: '0 days', basis: 'GDPR Art. 17' },
    { id: 'R-06', system: 'Kafka 3.4', category: 'User Topic Partitions', treatment: 'REDACT', retention: '0 days', basis: 'CCPA §1798.105' },
    { id: 'R-07', system: 'AWS S3 (Bronze Data Lake)', category: 'Raw Telemetry Parquet Dumps', treatment: 'DELETE', retention: '0 days', basis: 'GDPR Art. 17' },
    { id: 'R-08', system: 'AWS S3 (KYC Vault)', category: 'Passport & License Document Scans', treatment: 'DELETE', retention: '0 days', basis: 'GDPR Art. 17' },
    { id: 'R-09', system: 'Snowflake (Analytics Mart)', category: 'Customer Demographic Tables', treatment: 'ANONYMIZE', retention: '0 days', basis: 'GDPR Art. 17' },
    { id: 'R-10', system: 'DynamoDB (Device Tokens)', category: 'Push Notification Tokens', treatment: 'DELETE', retention: '0 days', basis: 'CCPA §1798.105' },
    { id: 'R-11', system: 'MongoDB (Customer Profiles)', category: 'Preference Documents', treatment: 'DELETE', retention: '0 days', basis: 'GDPR Art. 17' },
    { id: 'R-12', system: 'Cassandra (Activity Ledger)', category: 'Clickstream Row Keys', treatment: 'ANONYMIZE', retention: '0 days', basis: 'CCPA §1798.105' },
    { id: 'R-13', system: 'AWS Redshift (Warehouse)', category: 'Historical Sales Invoices', treatment: 'RETAIN', retention: '5 Years (1,825d)', basis: 'Tax Record Keeping' },
    { id: 'R-14', system: 'Google BigQuery (Audit Logs)', category: 'Immutable Compliance Log', treatment: 'RETAIN', retention: '10 Years (3,650d)', basis: 'Regulatory Audit' }
  ];

  return (
    <div className="flex flex-col w-full pb-16">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-wider text-[#3525cd] font-bold">
            Authoritative Policy Ruleset
          </span>
          <span className="text-[#464555]/40 text-xs">•</span>
          <span className="font-mono text-xs text-[#464555]">deletion_rules.csv</span>
        </div>
        <h1 className="font-display text-2xl font-semibold text-[#131b2e] tracking-tight mt-1">
          Policy Rules (42 Operational Constraints)
        </h1>
        <p className="text-sm text-[#464555] mt-0.5">
          Defines mandatory treatment per storage engine and data category: Delete, Redact, Anonymize, or Retain.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-[#eaedff] shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#f2f3ff] text-xs uppercase font-semibold text-[#464555] border-b border-[#eaedff]">
              <th className="py-2.5 px-4">Rule ID</th>
              <th className="py-2.5 px-4">Target System</th>
              <th className="py-2.5 px-4">Data Category</th>
              <th className="py-2.5 px-4">Required Treatment</th>
              <th className="py-2.5 px-4">Statutory Retention</th>
              <th className="py-2.5 px-4">Legal Foundation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eaedff]">
            {rules.map((r, i) => (
              <tr key={i} className="hover:bg-[#f2f3ff] transition-colors">
                <td className="py-2.5 px-4 font-mono font-bold text-[#3525cd]">{r.id}</td>
                <td className="py-2.5 px-4 font-medium text-[#131b2e]">{r.system}</td>
                <td className="py-2.5 px-4 text-[#464555]">{r.category}</td>
                <td className="py-2.5 px-4 font-mono font-bold">
                  <span className={`px-2 py-0.5 rounded ${
                    r.treatment === 'DELETE'
                      ? 'bg-[#ffdad6] text-[#93000a]'
                      : (r.treatment === 'RETAIN' ? 'bg-[#82f5c1]/40 text-[#00714e]' : 'bg-[#ffdcc3] text-[#703a00]')
                  }`}>
                    {r.treatment}
                  </span>
                </td>
                <td className="py-2.5 px-4 font-mono text-[#464555]">{r.retention}</td>
                <td className="py-2.5 px-4 font-medium text-[#131b2e]">{r.basis}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
