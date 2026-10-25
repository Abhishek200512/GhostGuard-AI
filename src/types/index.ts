export type PageRoute =
  | 'overview'
  | 'deletion-requests'
  | 'case-investigation'
  | 'evidence-intelligence'
  | 'evidence-explorer'
  | 'identity-resolution'
  | 'system-activity-lineage'
  | 'policy-rules'
  | 'remediation-planner'
  | 'evaluation-center'
  | 'submission-center'
  | 'settings';

export interface OverviewMetrics {
  total_ingested: number;
  complete: number;
  complete_pct: number;
  incomplete: number;
  incomplete_pct: number;
  not_applicable: number;
  not_applicable_pct: number;
  recreation_hazards: number;
  evidence_proofs_count: number;
  evidence_total: number;
  evidence_pct: number;
  confidence_interval: string;
}

export interface ResidualSystem {
  name: string;
  target: string;
  count: number;
  pct: number;
  color: 'error' | 'tertiary' | 'secondary' | 'primary';
}

export interface CaseSummary {
  case_id: string;
  email: string;
  name?: string;
  status: 'COMPLETE' | 'INCOMPLETE' | 'NOT_APPLICABLE';
  violations: string;
  hazard: string;
  hazard_type?: string;
  severity: string;
  systems_count?: number;
}

export interface RecreationHazard {
  id: string;
  badge: string;
  badge_type: 'error' | 'tertiary' | 'primary';
  lag: string;
  title: string;
  route: string;
  description: string;
  affects: string;
  action: string;
}

export interface TimelineEvent {
  time: string;
  tag: string;
  type: 'secondary' | 'primary' | 'outline';
  text: string;
}

export interface CaseDossierDetail {
  case_id: string;
  request_type: string;
  status: 'COMPLETE' | 'INCOMPLETE' | 'NOT_APPLICABLE';
  severity: string;
  subject: {
    name: string;
    primary_email: string;
    customer_id: string;
    legacy_id: string;
    global_uuid: string;
    historical_identifiers: string[];
    graph_footprint: Array<{ system: string; type: 'secondary' | 'error' | 'tertiary' | 'neutral' }>;
  };
  audit_cutoff: string;
  forensic_evaluated: string;
  rationale: {
    verdict: string;
    finding_id: string;
    text: string;
    status_strip: Array<{ system: string; status: string; icon: string; type: 'secondary' | 'error' | 'tertiary' }>;
  };
  data_integrity_score: {
    score: number;
    status: string;
    summary: string;
    sla_note: string;
  };
  confirmed_violations: Array<{ id: string; tag: string; description: string }>;
  regulatory_fine: string;
  recreation_risks: {
    badge: string;
    alert: string;
    description: string;
    consumer_group?: string;
    status: string;
    last_event: string;
    sparkline_rate?: string;
  } | null;
  evidence_manifest: Array<{
    id: string;
    system: string;
    badge: string;
    badge_type: 'error' | 'tertiary' | 'secondary';
    target: string;
    code: string;
    sha256?: string;
    display_hash?: string;
    ram?: string;
    lag?: string;
  }>;
  verification_pipeline: Array<{
    num: number;
    title: string;
    detail: string;
    status: string;
    type: 'secondary' | 'error' | 'neutral';
  }>;
  order_of_operations: string[];
}

export interface OCREvidencePage {
  page_number: number;
  extracted_text: string;
  ocr_confidence: number;
  has_embedded_text: boolean;
  ocr_applied: boolean;
}

export interface OCREvidenceAuditLog {
  id: string;
  action: string;
  performed_by: string;
  previous_case_id: string | null;
  new_case_id: string | null;
  reason: string;
  timestamp: string;
}

export interface OCREvidenceRecord {
  id: string;
  case_id: string | null;
  original_filename: string;
  stored_filename?: string;
  file_path?: string;
  mime_type: string;
  file_size_bytes: number;
  sha256_hash: string;
  extracted_text: string | null;
  page_count: number;
  extraction_method: 'NATIVE_TEXT' | 'TESSERACT_OCR' | 'HYBRID_PAGE_BY_PAGE' | 'FAILED' | string;
  ocr_language?: string;
  average_ocr_confidence: number;
  processing_status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | string;
  processing_error?: string | null;
  linking_method: 'EXPLICIT_HEADER' | 'AUTO_SUGGESTION_ACCEPTED' | 'MANUAL_OVERRIDE' | 'UNLINKED' | string;
  linking_confidence: number;
  created_at: string;
  updated_at?: string;
  pages?: OCREvidencePage[];
  audit_logs?: OCREvidenceAuditLog[];
}

export interface OCRHealthStatus {
  status: 'HEALTHY' | 'DEGRADED';
  tesseract_available: boolean;
  tesseract_version: string | null;
  tesseract_path: string | null;
  supported_formats: string[];
  max_file_size_mb: number;
  database_connected: boolean;
  storage_writable: boolean;
}
