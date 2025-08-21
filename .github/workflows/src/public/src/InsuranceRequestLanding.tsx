import React, { useMemo, useState } from "react";

/* ENV Helper */
function readEnv(key: string): string | undefined {
  try {
    // @ts-ignore
    return (import.meta as any)?.env?.[key];
  } catch {
    return undefined;
  }
}

const LEAD_ENDPOINT =
  readEnv("VITE_LEAD_ENDPOINT") ||
  ""; // 비워두면 제출 시 알림만 띄우고 저장은 건너뜀
const THANK_YOU_URL =
  readEnv("VITE_THANK_YOU_URL") ||
  "/thank-you.html";
const KAKAO_URL =
  readEnv("VITE_KAKAO_URL") ||
  "https://pf.kakao.com/_REPLACE";

const COVERAGES = [
  "실손(4세대)",
  "암진단비",
  "뇌혈관진단비",
  "허혈성심장질환",
  "운전자보험",
  "치아/치과",
  "종합(맞춤설계)",
];

export default function InsuranceRequestLanding() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    age: "",
    gender: "",
    insured: "본인",
    coverages: [] as string[],
    budget: "",
    company: "상관없음",
    hasExisting: "아니오",
    note: "",
    agree: false,
    website: "", // 허니팟 (봇 방지)
  });
  const [submitting, setSubmitting] = useState(false);

  const isValid = useMemo(() => {
    return (
      form.name.trim().length >= 2 &&
      /^(01\d-?\d{3,4}-?\d{4})$/.test(form.phone.replace(/\s/g, "")) &&
      Number(form.age) > 0 &&
      !!form.gender &&
      form.agree
    );
  }, [form]);

  const toggleCoverage = (c: string) => {
    setForm((f) => ({
      ...f,
      coverages: f.coverages.includes(c)
        ? f.coverages.filter((x) => x !== c)
        : [...f.coverages, c],
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    if (form.website) return; // 허니팟

    setSubmitting(true);
    try {
      if (!LEAD_ENDPOINT) {
        alert("제출 준비는 완료! 구글시트 저장을 활성화하려면 .env에 VITE_LEAD_ENDPOINT를 설정하세요.");
      } else {
        const payload = { ...form, ts: new Date().toISOString() };
        const res = await fetch(LEAD_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`submit failed: ${res.status}`);
      }
      // 성공/데모 모두 감사 페이지로 이동
      if (THANK_YOU_URL.startsWith("http")) {
        window.location.href = THANK_YOU_URL;
      } else {
        window.location.assign(THANK_YOU_URL);
      }
    } catch (err) {
      alert("전송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur bg-white/70 border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold">保</div>
            <span className="font-bold tracking-tight">보험교실</span>
            <span className="ml-2 text-xs rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5">무료 설계</span>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <a href="#form" className="text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl px-4 py-2">무료 설계 받기</a>
            <a href={KAKAO_URL} target="_blank" rel="noreferrer" className="text-sm font-semibold border border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-xl px-4 py-2">카톡 문의</a>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="mx-auto max-w-5xl px-4 py-12 grid lg:grid-cols-2 gap-10">
        <section>
          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight">
            1분 신청으로 <span className="text-emerald-600">맞춤 보험설계</span> 받기
          </h1>
          <p className="mt-3 text-slate-600">
            불필요한 담보는 줄이고 필요한 보장만, 합리적인 보험료로 제안해 드립니다.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-slate-700">
            <li>• 전문 설계사가 1:1 비교표 제공</li>
            <li>• 실손/암/뇌혈관/운전자/치아 등 맞춤형 커버리지</li>
            <li>• 전화/카톡/비대면 처리로 빠른 진행</li>
          </ul>
        </section>

        <section className="lg:pl-6">
          <form id="form" onSubmit={onSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-bold">무료 설계 요청</h3>
            <p className="mt-1 text-sm text-slate-600">연락처는 설계 및 상담 외 용도로 사용하지 않습니다.</p>

            {/* 허니팟 */}
            <div className="hidden">
              <label>Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e)=>setForm({ ...form, website: e.target.value })}/></label>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium">이름</span>
                <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" placeholder="홍길동" value={form.name} onChange={(e)=>setForm({ ...form, name: e.target.value })}/>
              </label>
              <label className="block">
                <span className="text-sm font-medium">연락처</span>
                <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" placeholder="01012345678" value={form.phone} onChange={(e)=>setForm({ ...form, phone: e.target.value })}/>
              </label>
              <label className="block">
                <span className="text-sm font-medium">나이</span>
                <input type="number" min={0} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" placeholder="만 나이" value={form.age} onChange={(e)=>setForm({ ...form, age: e.target.value })}/>
              </label>
              <label className="block">
                <span className="text-sm font-medium">성별</span>
                <div className="mt-1 flex gap-2">
                  {["남성","여성"].map(g=>(
                    <label key={g} className={`flex-1 cursor-pointer rounded-xl border px-4 py-2 text-center ${form.gender===g?'border-emerald-600 bg-emerald-50 text-emerald-700':'border-slate-300 hover:bg-slate-50'}`}>
                      <input type="radio" name="gender" className="sr-only" checked={form.gender===g} onChange={()=>setForm({ ...form, gender: g })}/>
                      {g}
                    </label>
                  ))}
                </div>
              </label>
              <label className="block">
                <span className="text-sm font-medium">피보험자</span>
                <select className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={form.insured} onChange={(e)=>setForm({ ...form, insured: e.target.value })}>
                  {["본인","배우자","자녀","부모","기타"].map(v=><option key={v} value={v}>{v}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium">월 예산(원)</span>
                <input type="number" min={0} step={1000} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" placeholder="예: 70000" value={form.budget} onChange={(e)=>setForm({ ...form, budget: e.target.value })}/>
              </label>
            </div>

            <div className="mt-4">
              <span className="block text-sm font-medium">관심 담보</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {COVERAGES.map(c=>(
                  <button key={c} type="button" onClick={()=>toggleCoverage(c)}
                    className={`px-3 py-1.5 rounded-full border text-sm ${form.coverages.includes(c)?'bg-emerald-50 text-emerald-700 border-emerald-600':'border-slate-300 hover:bg-slate-50'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <span className="block text-sm font-medium">요청/메모</span>
              <textarea className="mt-1 w-full h-24 rounded-xl border border-slate-300 px-3 py-2" placeholder="예) 암 3천 + 뇌혈관 2천 위주로 보고 싶어요" value={form.note} onChange={(e)=>setForm({ ...form, note: e.target.value })}/>
            </div>

            <label className="mt-4 flex items-start gap-2">
              <input type="checkbox" className="mt-1 w-4 h-4" checked={form.agree} onChange={(e)=>setForm({ ...form, agree: e.target.checked })}/>
              <span className="text-sm text-slate-700">(필수) 개인정보 수집·이용에 동의합니다.</span>
            </label>

            <button disabled={!isValid || submitting}
              className={`mt-6 w-full inline-flex justify-center items-center rounded-xl px-5 py-3 font-semibold ${!isValid||submitting?'bg-slate-300 text-slate-500':'bg-emerald-600 text-white hover:bg-emerald-700'}`}>
              {submitting ? "전송 중…" : "무료 설계 요청 보내기"}
            </button>

            <p className="mt-2 text-xs text-slate-500">
              * 동의 철회 및 삭제 요청: 카카오 채널 또는 02-000-0000
            </p>
            <a className="mt-4 inline-flex justify-center items-center rounded-xl border border-emerald-200 text-emerald-700 px-4 py-2"
               href={KAKAO_URL} target="_blank" rel="noreferrer">카톡 문의</a>
          </form>
        </section>
      </main>

      {/* 모바일 플로팅 CTA */}
      <div className="fixed bottom-4 left-0 right-0 z-40 px-4 sm:hidden">
        <div className="grid grid-cols-2 gap-3">
          <a href="#form" className="block text-center bg-emerald-600 text-white font-semibold rounded-xl py-3 shadow-lg shadow-emerald-600/20">무료 설계 요청</a>
          <a href={KAKAO_URL} target="_blank" rel="noreferrer" className="block text-center border border-emerald-200 text-emerald-700 font-semibold rounded-xl py-3 bg-white">카톡 문의</a>
        </div>
      </div>
    </div>
  );
}
