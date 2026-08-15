'use client';

import { useQuery } from '@tanstack/react-query';
import { getLr } from '@/lib/api-lr';
import { DocumentShell, PartyBlock } from '@/components/print/DocumentShell';
import { money, formatDate } from '@/lib/format';
import { shareOnWhatsApp } from '@/lib/share';

export default function LrPrintPage({ params }: { params: { id: string } }) {
  const { data: lr, isLoading } = useQuery({
    queryKey: ['lr', params.id],
    queryFn: () => getLr(params.id),
  });

  if (isLoading || !lr) {
    return <div className="p-10 text-center text-slate-500">Loading document…</div>;
  }

  function share() {
    if (!lr) return;
    shareOnWhatsApp(
      `Lorry Receipt ${lr.number} for consignment from ${lr.fromCity || '—'} to ${lr.toCity || '—'}. Total freight ${money(lr.total)}.`,
      lr.consignorPhone,
    );
  }

  return (
    <DocumentShell title="Lorry Receipt" onShare={share}>
      <div className="mb-6 flex items-start justify-between text-sm">
        <div>
          <p>
            <span className="text-slate-500">LR No: </span>
            <span className="font-semibold text-slate-900">{lr.lrNumber || lr.number}</span>
          </p>
          <p>
            <span className="text-slate-500">Date: </span>
            {formatDate(lr.lrDate)}
          </p>
          {lr.vehicleNo && (
            <p>
              <span className="text-slate-500">Vehicle: </span>
              {lr.vehicleNo}
            </p>
          )}
        </div>
        <div className="text-right">
          {lr.riskType && (
            <p>
              <span className="text-slate-500">Risk: </span>
              {lr.riskType}
            </p>
          )}
          {lr.driverName && (
            <p>
              <span className="text-slate-500">Driver: </span>
              {lr.driverName} {lr.driverMobile && `(${lr.driverMobile})`}
            </p>
          )}
        </div>
      </div>

      {/* Consignor / Consignee */}
      <div className="mb-4 grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-4">
        <PartyBlock
          heading="Consignor (From)"
          name={lr.consignorName}
          lines={[
            lr.consignorPhone && `Ph: ${lr.consignorPhone}`,
            lr.consignorGstin && `GSTIN: ${lr.consignorGstin}`,
            [lr.fromCity, lr.fromState].filter(Boolean).join(', '),
            lr.fromAddress,
          ]}
        />
        <PartyBlock
          heading="Consignee (To)"
          name={lr.consigneeName}
          lines={[
            lr.consigneePhone && `Ph: ${lr.consigneePhone}`,
            lr.consigneeGstin && `GSTIN: ${lr.consigneeGstin}`,
            [lr.toCity, lr.toState].filter(Boolean).join(', '),
            lr.toAddress,
          ]}
        />
      </div>

      {/* Package details */}
      <table className="mb-4 w-full text-sm">
        <thead>
          <tr className="border-b border-slate-300 text-left text-slate-500">
            <th className="py-2">Packages</th>
            <th className="py-2">Actual Wt</th>
            <th className="py-2">Charged Wt</th>
            <th className="py-2">Condition</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-slate-100">
            <td className="py-2">{lr.noOfPackage ?? '—'}</td>
            <td className="py-2">
              {lr.actualWeight ? `${lr.actualWeight} ${lr.actualWeightUnit || ''}` : '—'}
            </td>
            <td className="py-2">
              {lr.chargedWeight ? `${lr.chargedWeight} ${lr.chargedWeightUnit || ''}` : '—'}
            </td>
            <td className="py-2">{lr.packageCondition || '—'}</td>
          </tr>
        </tbody>
      </table>
      {lr.packageDescription && (
        <p className="mb-4 text-sm">
          <span className="text-slate-500">Description: </span>
          {lr.packageDescription}
        </p>
      )}

      {/* Freight breakdown */}
      <div className="flex justify-end">
        <div className="w-72 space-y-1 text-sm">
          <Row label="Basic Freight" value={money(lr.totalBasicFreight)} />
          {lr.loadingCharge > 0 && <Row label="Loading" value={money(lr.loadingCharge)} />}
          {lr.unloadingCharge > 0 && <Row label="Unloading" value={money(lr.unloadingCharge)} />}
          {lr.stCharge > 0 && <Row label="S.T Charge" value={money(lr.stCharge)} />}
          {lr.otherCharges > 0 && <Row label="Other" value={money(lr.otherCharges)} />}
          {lr.lrCnCharges > 0 && <Row label="LR/CN Charges" value={money(lr.lrCnCharges)} />}
          {lr.gstCharge > 0 && (
            <Row label={`GST (${lr.gstPercent}%)`} value={money(lr.gstCharge)} />
          )}
          <div className="mt-1 flex justify-between border-t border-slate-800 pt-2 text-base font-bold text-slate-900">
            <span>Total Freight</span>
            <span>{money(lr.total)}</span>
          </div>
          {lr.gstPaidBy && (
            <p className="pt-1 text-right text-xs text-slate-500">GST paid by: {lr.gstPaidBy}</p>
          )}
        </div>
      </div>

      {lr.materialInsurance === 'Insured' && (
        <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
          <span className="font-semibold text-slate-800">Insurance: </span>
          {lr.insuranceCompany} · Policy {lr.policyNumber} · Amount {lr.insuredAmount}
        </div>
      )}
    </DocumentShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      <span>{value}</span>
    </div>
  );
}
