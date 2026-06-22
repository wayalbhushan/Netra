"use client";
import React from "react";
import { Shield, CheckCircle, Database, AlertCircle } from "lucide-react";

interface VerificationData {
  verified: boolean;
  subject_name: string;
  issuer: string;
  blockchain_block: number;
  zkp_proof_valid: boolean;
  message: string;
}

interface IdentityPanelProps {
  verification: VerificationData | null;
  did: string;
  onVerify: () => void;
  isLoading: boolean;
}

export default function IdentityPanel({ verification, did, onVerify, isLoading }: IdentityPanelProps) {
  return (
    <div className="w-full h-full flex flex-col bg-zinc-950 p-4 border border-zinc-800 font-mono text-[10px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3 select-none">
        <span className="font-bold text-zinc-300">W3C SSI VERIFICATION SYSTEM</span>
        <span className="text-[9px] text-zinc-500 uppercase">Polygon Web3 Anchor</span>
      </div>

      <div className="flex-1 space-y-4">
        {/* Decentralized ID Details */}
        <div className="bg-zinc-900/40 border border-zinc-800 p-2.5 space-y-2">
          <div className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold border-b border-zinc-800/80 pb-1 flex justify-between">
            <span>Decentralized ID (DID)</span>
            <span className="text-emerald-500 font-bold">W3C SPEC</span>
          </div>

          <div className="flex justify-between items-center py-0.5">
            <span className="text-zinc-500">DID URI:</span>
            <span className="text-zinc-300 font-semibold truncate max-w-[170px]" title={did}>
              {did}
            </span>
          </div>

          <div className="flex justify-between items-center py-0.5">
            <span className="text-zinc-500">DID status:</span>
            <span className="text-emerald-500 font-bold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> ACTIVE_ON_CHAIN
            </span>
          </div>
        </div>

        {/* Dynamic Verification Output */}
        {isLoading ? (
          <div className="py-6 flex items-center justify-center text-zinc-500">
            [ QUERYING POLYGON NODE & VERIFYING ZKP PROOFS... ]
          </div>
        ) : verification ? (
          <div className="space-y-3">
            {/* Success card with ZKP verified badge */}
            <div className="border border-emerald-900/50 bg-emerald-950/10 p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-emerald-500 font-bold uppercase tracking-wider text-[9px] flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5" /> Identity Authenticated
                </span>
                <span className="px-1.5 py-0.5 border border-emerald-500/30 bg-emerald-950/50 rounded font-bold text-[8px] text-emerald-400">
                  ZKP VALIDATED
                </span>
              </div>
              <p className="text-zinc-300 leading-relaxed text-[9px]">
                {verification.message}
              </p>
            </div>

            {/* Crypto Metadata Table */}
            <div className="bg-zinc-900/40 border border-zinc-800 p-2.5 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-zinc-500">Credential Subject:</span>
                <span className="text-zinc-300 font-semibold">{verification.subject_name}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-zinc-500">ZKP Shielding Status:</span>
                <span className="text-emerald-500 font-bold flex items-center gap-0.5">
                  <Shield className="h-3 w-3" /> SECURED
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-zinc-500">Ledger Block Height:</span>
                <span className="text-zinc-300 font-semibold flex items-center gap-1">
                  <Database className="h-3 w-3 text-zinc-500" /> {verification.blockchain_block}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-zinc-500">Accredited Issuer:</span>
                <span className="text-zinc-300 font-semibold truncate max-w-[130px]" title={verification.issuer}>
                  {verification.issuer.split(":").pop()}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-6 border border-dashed border-zinc-800 rounded flex flex-col items-center justify-center gap-2.5 text-zinc-500">
            <AlertCircle className="h-5 w-5 text-zinc-600" />
            <span>ZKP Accreditations Not Loaded</span>
            <button
              onClick={onVerify}
              className="mt-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-bold rounded transition-colors text-[9px]"
            >
              RUN ZERO-KNOWLEDGE PROOF
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
