import React from 'react';

export const SystemLineageView: React.FC = () => {
  const topologies = [
    { name: 'PostgreSQL 15 (Primary OLTP)', role: 'Primary User Core DB', status: 'PURGED', residuals: 0, tombstone: 'VERIFIED' },
    { name: 'Elasticsearch v8.9 (Search Cluster)', role: 'Customer Search Index', status: 'VIOLATION', residuals: 84, tombstone: 'UNPURGED' },
    { name: 'Redis Cluster (Session Cache)', role: 'Auth Session Store', status: 'VIOLATION', residuals: 29, tombstone: 'TTL -1 OVERRIDE' },
    { name: 'Kafka 3.4 (Message Queue)', role: 'CDC Pipeline Broker', status: 'VIOLATION', residuals: 18, tombstone: 'TOPIC LAG' },
    { name: 'AWS S3 (Bronze Data Lake)', role: 'Nightly Parquet Snapshots', status: 'VIOLATION', residuals: 62, tombstone: 'FILTER LEAK' },
    { name: 'Snowflake (Analytics Mart)', role: 'Reporting DWH', status: 'QUARANTINED', residuals: 12, tombstone: 'UNHASHED PII' },
    { name: 'AWS S3 (KYC Vault)', role: 'Identity PDF Documents', status: 'VIOLATION', residuals: 8, tombstone: 'UNLINKED' },
    { name: 'DynamoDB (Device Tokens)', role: 'Mobile Push Tokens', status: 'PURGED', residuals: 0, tombstone: 'VERIFIED' },
    { name: 'MongoDB (Customer Profiles)', role: 'User Preferences', status: 'PURGED', residuals: 0, tombstone: 'VERIFIED' },
    { name: 'Cassandra (Activity Ledger)', role: 'Clickstream Rows', status: 'PURGED', residuals: 0, tombstone: 'ANONYMIZED' },
    { name: 'AWS Redshift (Warehouse)', role: 'Historical Sales', status: 'RETAINED_LEGAL', residuals: 0, tombstone: 'STATUTORY HOLD' },
    { name: 'Google BigQuery (Audit Logs)', role: 'Compliance Records', status: 'RETAINED_LEGAL', residuals: 0, tombstone: 'STATUTORY HOLD' },
    { name: 'ClickHouse (Metrics Store)', role: 'Telemetry Aggregations', status: 'PURGED', residuals: 0, tombstone: 'VERIFIED' },
    { name: 'RabbitMQ (Notifications)', role: 'Email Queues', status: 'PURGED', residuals: 0, tombstone: 'VERIFIED' },
    { name: 'OpenSearch (Log Index)', role: 'API Access Logs', status: 'PURGED', residuals: 0, tombstone: 'REDACTED' },
    { name: 'Memcached (API Gateways)', role: 'Edge Session Keys', status: 'PURGED', residuals: 0, tombstone: 'VERIFIED' },
    { name: 'Neo4j (Identity Graph)', role: 'Social Graph Nodes', status: 'PURGED', residuals: 0, tombstone: 'VERIFIED' },
    { name: 'AWS Glacier (Cold Vault Archive)', role: 'Disaster Recovery Backups', status: 'RETAINED_EXEMPT', residuals: 0, tombstone: 'BACKUP EXEMPT' }
  ];

  return (
    <div className="flex flex-col w-full pb-16">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-wider text-[#3525cd] font-bold">
            Distributed Systems Topology
          </span>
          <span className="text-[#464555]/40 text-xs">•</span>
          <span className="font-mono text-xs text-[#464555]">18 Monitored Backends</span>
        </div>
        <h1 className="font-display text-2xl font-semibold text-[#131b2e] tracking-tight mt-1">
          System Activity & Data Lineage
        </h1>
        <p className="text-sm text-[#464555] mt-0.5">
          End-to-end data flow telemetry mapping primary storage engines, downstream replication pipelines, and resurrection hazards.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-[#eaedff] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#eaedff] flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-[#131b2e]">Backend Topology Ledger</h2>
          <span className="font-mono text-xs text-[#ba1a1a] font-bold">14 Active Desyncs Flagged</span>
        </div>

        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#f2f3ff] text-xs uppercase font-semibold text-[#464555] border-b border-[#eaedff]">
              <th className="py-2.5 px-4">System Node</th>
              <th className="py-2.5 px-4">Operational Role</th>
              <th className="py-2.5 px-4">Audit Status</th>
              <th className="py-2.5 px-4">Residual Records</th>
              <th className="py-2.5 px-4">Tombstone State</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eaedff]">
            {topologies.map((t, idx) => (
              <tr key={idx} className="hover:bg-[#f2f3ff] transition-colors">
                <td className="py-2.5 px-4 font-mono font-bold text-[#131b2e]">{t.name}</td>
                <td className="py-2.5 px-4 text-[#464555]">{t.role}</td>
                <td className="py-2.5 px-4">
                  <span className={`px-2 py-0.5 rounded-full font-mono text-xs font-bold ${
                    t.status === 'PURGED'
                      ? 'bg-[#82f5c1]/40 text-[#00714e]'
                      : (t.status === 'VIOLATION'
                        ? 'bg-[#ffdad6] text-[#93000a]'
                        : (t.status === 'QUARANTINED' ? 'bg-[#ffdcc3] text-[#703a00]' : 'bg-[#eaedff] text-[#464555]'))
                  }`}>
                    {t.status}
                  </span>
                </td>
                <td className="py-2.5 px-4 font-mono font-semibold">
                  <span className={t.residuals > 0 ? 'text-[#ba1a1a]' : 'text-[#006c4a]'}>
                    {t.residuals} records
                  </span>
                </td>
                <td className="py-2.5 px-4 font-mono text-xs text-[#464555]">{t.tombstone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
