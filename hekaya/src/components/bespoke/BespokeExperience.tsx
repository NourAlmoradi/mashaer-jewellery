"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Check, CheckCheck, ChevronDown, Gem, ImagePlus, LoaderCircle, LockKeyhole, MessageCircle, PencilLine, Plus, Send, X } from "lucide-react";
import { useT } from "@/lib/useT";
import { useAdminSettings } from "@/stores/adminSettings.store";
import { prepareImage } from "@/lib/image";
import { whatsappUrl } from "@/lib/utils";
import { EMIRATES } from "@/lib/emirates";
import { BUDGETS, PIECES, MAX_REFERENCE_BYTES, optionLabel, uaeToday, validateBespokeBrief, type BespokeBrief } from "@/lib/bespoke";
import styles from "./BespokeExperience.module.css";

type PickedImage = { id: string; blob: Blob; url: string };
const initial: BespokeBrief = { piece: "", idea: "", budget: "guidance", occasion: "", desiredDate: "", name: "", phone: "", email: "", emirate: "", contactMethod: "whatsapp", locale: "ar", productSlug: "" };

export function BespokeExperience({ productSlug = "" }: { productSlug?: string }) {
  const { locale, dir } = useT();
  const ar = locale === "ar";
  const say = (arabic: string, english: string) => ar ? arabic : english;
  const [brief, setBrief] = useState({ ...initial, productSlug });
  const [step, setStep] = useState(0);
  const [images, setImages] = useState<PickedImage[]>([]);
  const imagesRef = useRef<PickedImage[]>([]);
  const [processing, setProcessing] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [requestKey, setRequestKey] = useState(() => crypto.randomUUID());
  const formTitle = useRef<HTMLHeadingElement>(null);
  const requestCard = useRef<HTMLDivElement>(null);
  const upload = useRef<HTMLInputElement>(null);
  const ideaInput = useRef<HTMLTextAreaElement>(null);
  const whatsapp = useAdminSettings((s) => s.store.whatsapp);
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  const BackArrow = dir === "rtl" ? ArrowRight : ArrowLeft;
  const set = (key: keyof BespokeBrief, value: string) => setBrief((current) => ({ ...current, [key]: value }));
  useEffect(() => { imagesRef.current = images; }, [images]);
  useEffect(() => () => { imagesRef.current.forEach((item) => URL.revokeObjectURL(item.url)); }, []);

  const moveTo = (next: number) => {
    setStep(next); setError("");
    requestAnimationFrame(() => { formTitle.current?.focus({ preventScroll: true }); requestCard.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }); });
  };
  async function addImages(files: FileList | File[]) {
    if (processing || sending) return;
    if (images.length + files.length > 3) { setError(say("يمكنك إضافة ثلاث صور كحد أقصى.", "You can add up to three images.")); return; }
    setProcessing(true); setError("");
    const prepared: PickedImage[] = [];
    try {
      for (const file of Array.from(files)) {
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("type");
        const blob = await prepareImage(file, { maxDim: 1200, quality: 0.82, maxInputBytes: 12 * 1024 * 1024, stripMetadata: true });
        if (blob.size > MAX_REFERENCE_BYTES) throw new Error("size");
        prepared.push({ id: crypto.randomUUID(), blob, url: URL.createObjectURL(blob) });
      }
      setImages((current) => [...current, ...prepared]);
    } catch {
      prepared.forEach((item) => URL.revokeObjectURL(item.url));
      setError(say("اختر صورة JPG أو PNG أو WEBP بحجم أقل من ١٢ ميجابايت. جرّب صورة أصغر إذا استمرت المشكلة.", "Choose a JPG, PNG or WEBP under 12 MB. Try a smaller image if the issue continues."));
    } finally { setProcessing(false); if (upload.current) upload.current.value = ""; }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending || processing) return;
    if (step === 0 && brief.idea.trim().length < 10) { setError(say("اكتب كلمات بسيطة عن فكرتك، أو اختر «أحتاج مساعدتكم».", "Tell us a little about your idea, or choose 'I'd like your guidance'.")); return; }
    if (step < 2) { moveTo(step + 1); return; }
    if (!validateBespokeBrief({ ...brief, locale })) { setError(say("يرجى التأكد من الاسم ورقم الهاتف، وإضافة بريد صحيح إذا اخترت التواصل بالبريد.", "Please check your name and phone number, and add a valid email if you chose email contact.")); return; }
    setSending(true); setError("");
    const data = new FormData();
    data.set("brief", JSON.stringify({ ...brief, locale })); data.set("consent", String(consent)); data.set("website", website); data.set("requestKey", requestKey);
    images.forEach((item, index) => data.append("references", item.blob, `reference-${index + 1}.jpg`));
    try {
      const response = await fetch("/api/bespoke", { method: "POST", body: data });
      const result = await response.json();
      if (!response.ok || !result.ok || !result.reference) {
        if (result.error === "request_conflict") {
          setRequestKey(crypto.randomUUID());
          setError(say("تم حفظ طلبك السابق بالفعل. إذا أردت إرسال هذه التعديلات كطلب جديد، اضغط الإرسال مرة أخرى.", "Your previous request was already saved. To send these changes as a new request, press Send again."));
          return;
        }
        setError(result.error === "rate_limited"
          ? say("وصلتنا عدة محاولات. يرجى المحاولة بعد عشر دقائق.", "There have been several attempts. Please try again in ten minutes.")
          : say("لم يتم إرسال الطلب. معلوماتك ما زالت هنا؛ يرجى المحاولة مرة أخرى.", "Your request was not sent. Your details are still here; please try again."));
        return;
      }
      setReference(result.reference);
      requestAnimationFrame(() => formTitle.current?.focus());
    } catch { setError(say("تعذّر الاتصال. معلوماتك محفوظة في هذه الصفحة؛ حاول مجددًا.", "Connection failed. Your details are still on this page; please try again.")); }
    finally { setSending(false); }
  }
  const journey = [
    { title: say("شاركنا فكرتك", "Share your idea"), text: say("كلمات بسيطة، وصورة أو رسمة إن أحببت.", "A few words, with a photo or sketch if you like.") },
    { title: say("نتفق على التفاصيل", "Agree the details"), text: say("نناقش التصميم والخامة والسعر وموعد التسليم.", "We discuss the design, material, price and delivery.") },
    { title: say("نبدأ بعد موافقتك", "Create with your approval"), text: say("يبدأ التنفيذ بعد اعتمادك للتصميم والعرض.", "Production starts once you approve the design and quote.") },
  ];
  const titles = [say("لنبدأ بفكرتك.", "It starts with your idea."), say("تفاصيل تجعلها أقرب إليك.", "A few details, a little more you."), say("كيف نصل إليك؟", "How can we reach you?")];
  const steps = [say("فكرتك", "Your idea"), say("التفضيلات", "Preferences"), say("التواصل", "Contact")];
  const wa = whatsappUrl(whatsapp, say(`مرحبًا مشاعر، أود متابعة طلب تصميمي الخاص ${reference}. اسمي ${brief.name}.`, `Hello Mashaer, I'd like to discuss my custom request ${reference}. My name is ${brief.name}.`));

  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="bespoke-title">
        <div className={styles.heroCopy}>
          <nav className={styles.breadcrumb} aria-label={say("مسار الصفحة", "Breadcrumb")}><Link href="/">{say("مشاعر", "Mashaer")}</Link><span aria-hidden="true">/</span><span aria-current="page">{say("تصميم خاص", "Bespoke")}</span></nav>
          <p className={styles.eyebrow}><span />{say("مجوهرات تُصمّم من أجلك", "Jewellery, made personal")}</p>
          <h1 id="bespoke-title">{say("قطعة تبدأ منك.", "It begins with you.")}<br /><em>{say("وتحمل حكايتك.", "It becomes your story.")}</em></h1>
          <p className={styles.heroDescription}>{say("اسم له مكانة، رسمة صغيرة، أو فكرة في بالك. شاركنا ما تتخيّله، ولنصمّم معًا قطعة تحمل معناك.", "A meaningful name, a little drawing, an idea you've held onto. Tell us what you imagine. Let's turn it into a piece with meaning.")}</p>
          <div className={styles.heroActions}><a href="#private-request" className={styles.primary}>{say("لنبدأ بفكرتك", "Share your idea")}<Arrow size={18} /></a><a href="#the-journey" className={styles.textLink}>{say("كيف تتم الرحلة؟", "How it works")}<ChevronDown size={15} /></a></div>
          <p className={styles.privacy}><LockKeyhole size={15} />{say("طلب خاص، بينك وبين فريق مشاعر فقط.", "A private request. Just you and the Mashaer team.")}</p>
        </div>
        <figure className={styles.heroVisual}>
          <div className={styles.heroPhoto}>
          <Image src="/bespoke/atelier.webp" alt={say("صورة توضيحية لقلادة نجمة ذهبية بجانب رسمتها بالقلم", "Illustrative gold star pendant beside its pencil sketch")} fill sizes="(max-width: 800px) 100vw, 55vw" priority quality={90} />
          </div>
          <figcaption className={styles.photoNote}>{say("من الفكرة إلى القطعة · صورة توضيحية", "From sketch to piece · An illustrative image")}</figcaption>
        </figure>
      </section>

      <section id="the-journey" className={styles.journey} aria-label={say("رحلة تصميم قطعتك", "Your bespoke journey")}>
        {journey.map(({ title, text }, index) => <div className={styles.journeyItem} key={title}><span className={styles.journeyNumber} aria-hidden="true">0{index + 1}</span><div><h2>{title}</h2><p>{text}</p></div></div>)}
      </section>

      <section id="private-request" className={styles.requestSection} aria-labelledby="request-title">
        <aside className={styles.requestAside}>
          <p className={styles.eyebrow}>{say("مساحة لفكرتك", "A space for your idea")}</p>
          <h2>{say("فكرة بسيطة", "A little idea")}{" "}<em>{say("تكفي للبداية.", "is a lovely start.")}</em></h2>
          <p>{say("أخبرنا بما يجعل القطعة مميزة لك. نساعدك في اختيار التفاصيل المناسبة.", "Tell us what would make your piece meaningful. We'll help you choose the details.")}</p>
          <div className={styles.asidePrivacy}><LockKeyhole size={18} /><div><strong>{say("فكرتك تبقى خاصة", "Your idea stays private")}</strong><p>{say("صورك وتفاصيل طلبك لا تظهر للزوار أو للعملاء الآخرين.", "Your images and request details are never shown to visitors or other customers.")}</p></div></div>
        </aside>
        <div className={styles.formCard} ref={requestCard}>
          {reference ? <div className={styles.success} role="status">
            <span className={styles.successIcon}><CheckCheck size={30} strokeWidth={1.3} /></span>
            <p className={styles.eyebrow}>{say("وصلتنا فكرتك", "Your idea is with us")}</p>
            <h2 ref={formTitle} tabIndex={-1} id="request-title">{say("لكل قطعة حكاية. وهذه بدايتها.", "Every piece has a story. This is its beginning.")}</h2>
            <p>{say("سيطّلع فريق مشاعر على طلبك ويتواصل معك لمناقشة التفاصيل عبر وسيلتك المفضلة.", "The Mashaer team will review your request and get in touch through your preferred channel.")}</p>
            <div className={styles.reference}><small>{say("رقم طلبك الخاص", "Your private request reference")}</small><strong dir="ltr">{reference}</strong></div>
            <p>{say("احتفظ بهذا الرقم. لم يتم خصم أي مبلغ، ويبدأ التنفيذ بعد الاتفاق معك.", "Keep this reference. No payment has been taken. Production begins after we agree the details with you.")}</p>
            {wa && <a href={wa} target="_blank" rel="noreferrer" className={styles.primary}><MessageCircle size={18} />{say("متابعة طلبي على واتساب", "Continue on WhatsApp")}</a>}
            <Link href="/products" className={styles.textLink}>{say("اكتشف قطع مشاعر", "Explore Mashaer pieces")}<Arrow size={16} /></Link>
          </div> : <>
            <ol className={styles.steps} aria-label={say("خطوات الطلب", "Request steps")}>{steps.map((title, index) => <li key={title} data-active={step === index} data-done={step > index} aria-current={step === index ? "step" : undefined}><button type="button" onClick={() => moveTo(index)} disabled={index > step || sending || processing} aria-label={say(`الخطوة ${index + 1}: ${title}`, `Step ${index + 1}: ${title}`)}><span>{step > index ? <Check size={14} /> : index + 1}</span><strong>{title}</strong></button></li>)}</ol>
            <div className={styles.formHeading}><h2 id="request-title" ref={formTitle} tabIndex={-1}>{titles[step]}</h2><p>{step === 0 ? say("لا تحتاج إلى تصميم جاهز. ابدأ بما لديك.", "You don't need a finished design. Start with what you have.") : step === 1 ? say("اختيارات مبدئية نناقشها معك، وليست التزامًا بالشراء.", "Starting points we can discuss together, with no commitment to buy.") : say("سيصل طلبك مباشرة إلى فريق مشاعر لمناقشته معك بشكل خاص.", "Your request goes directly to the Mashaer team for a private conversation.")}</p></div>
            <form onSubmit={submit} className={styles.form} aria-busy={sending || processing}>
              <div className={styles.honeypot} aria-hidden="true"><label>Website<input name="website" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" /></label></div>
              {step === 0 && <>
                {productSlug && <p className={styles.productHint}><Gem size={16} />{say("سنرفق القطعة التي اخترتها كنقطة بداية لطلبك.", "We'll include your selected piece as a starting point.")}<Link href={`/product/${encodeURIComponent(productSlug)}`}>{say("عرض القطعة", "View piece")}</Link></p>}
                <fieldset className={styles.fieldset}><legend>{say("ما القطعة التي تتخيّلها؟", "What kind of piece do you imagine?")}</legend><div className={styles.pieceOptions}>{PIECES.map((piece) => <label className={styles.choice} key={piece.id}><input type="radio" name="piece" value={piece.id} checked={brief.piece === piece.id} onChange={() => set("piece", piece.id)} required /><span>{piece[locale]}</span></label>)}</div></fieldset>
                <label className={styles.field} htmlFor="bespoke-idea"><span>{say("احكِ لنا عن فكرتك", "Tell us about your idea")}</span><textarea ref={ideaInput} id="bespoke-idea" aria-describedby="bespoke-idea-hint" value={brief.idea} onChange={(e) => set("idea", e.target.value)} required minLength={10} maxLength={600} rows={4} placeholder={say("مثلًا: قلادة صغيرة بحرف اسم ابنتي، مع تفصيلة على شكل زهرة…", "For example: a little pendant with my daughter's initial and a delicate flower detail…")} /><small id="bespoke-idea-hint">{say("ما الذي تحبّه فيها؟ ولمن ستكون؟", "What would make it meaningful? Who is it for?")}<span dir="ltr">{brief.idea.length}/600</span></small></label>
                {!brief.idea.trim() && <button className={styles.guidance} type="button" onClick={() => { set("idea", say("أرغب في مساعدتكم لاختيار فكرة قطعة خاصة.", "I'd like your help choosing an idea for a personal piece.")); ideaInput.current?.focus(); }}>{say("لم أحدّد فكرتي بعد، أحتاج مساعدتكم", "Still deciding? I'd like your guidance")}</button>}
                <div className={styles.uploadArea} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); void addImages(Array.from(e.dataTransfer.files)); }}>
                  <label htmlFor="bespoke-images" className={styles.uploadLabel}><ImagePlus size={25} strokeWidth={1.3} /><strong>{processing ? say("نجهّز صورك…", "Preparing your images…") : say("صور أو رسومات مرجعية", "Reference photos or sketches")}<span>{say("اختياري", "Optional")}</span></strong><small>{say("حتى ٣ صور · JPG، PNG أو WEBP · ١٢ MB للصورة", "Up to 3 images · JPG, PNG or WEBP · 12 MB each")}</small><span className={styles.uploadButton}><Plus size={14} />{say("اختيار صور", "Choose images")}</span></label>
                  <input ref={upload} id="bespoke-images" type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={processing || sending || images.length >= 3} onChange={(e) => { if (e.target.files) void addImages(e.target.files); }} className={styles.fileInput} />
                </div>
                {images.length > 0 && <div className={styles.previews}>{images.map((item, index) => <div key={item.id}><Image src={item.url} width={88} height={88} unoptimized alt={say(`الصورة المرجعية ${index + 1}`, `Reference image ${index + 1}`)} /><button type="button" onClick={() => { URL.revokeObjectURL(item.url); setImages((current) => current.filter((image) => image.id !== item.id)); }} aria-label={say(`حذف الصورة ${index + 1}`, `Remove image ${index + 1}`)}><X size={14} /></button></div>)}</div>}
                <p className={styles.inlinePrivacy}><LockKeyhole size={13} />{say("صورك تصل إلى فريقنا فقط، ولا تُنشر في الموقع.", "Only our team receives your images. They aren't published on the site.")}</p>
              </>}
              {step === 1 && <>
                <fieldset className={styles.fieldset}><legend>{say("ما الميزانية المريحة لك؟", "What budget feels comfortable?")}</legend><p className={styles.fieldHint}>{say("لنساعدك باقتراح مناسب. السعر النهائي بعد دراسة الفكرة.", "This helps us suggest suitable options. Final pricing follows our review.")}</p><div className={styles.budgetOptions}>{BUDGETS.map((budget) => <label className={styles.choice} key={budget.id}><input type="radio" name="budget" value={budget.id} checked={brief.budget === budget.id} onChange={() => set("budget", budget.id)} /><span>{budget[locale]}{brief.budget === budget.id && <Check size={15} />}</span></label>)}</div></fieldset>
                <label className={styles.field} htmlFor="bespoke-occasion"><span>{say("هل وراءها مناسبة؟", "Is there an occasion?")}<em>{say("اختياري", "Optional")}</em></span><input id="bespoke-occasion" value={brief.occasion} onChange={(e) => set("occasion", e.target.value)} maxLength={60} placeholder={say("مولود جديد، عيد ميلاد، أو هدية من القلب…", "A new arrival, a birthday, or just because…")} /></label>
                <label className={styles.field} htmlFor="bespoke-date"><span>{say("هل لديك موعد في بالك؟", "Do you have a date in mind?")}<em>{say("اختياري", "Optional")}</em></span><input id="bespoke-date" type="date" value={brief.desiredDate} min={uaeToday()} onChange={(e) => set("desiredDate", e.target.value)} /><small>{say("نؤكد معك إمكانية التنفيذ وموعد التسليم قبل البدء.", "We'll confirm feasibility and delivery timing with you before starting.")}</small></label>
                <div className={styles.gentleNote}><PencilLine size={21} strokeWidth={1.3} /><p>{say("الخامة والمقاس والنقش؟ نختار تفاصيلها معك بعد أن نفهم فكرتك.", "Materials, size and engraving? We'll work through those with you once we understand your idea.")}</p></div>
              </>}
              {step === 2 && <>
                <div className={styles.contactFields}>
                <label className={styles.field} htmlFor="bespoke-name"><span>{say("اسمك", "Your name")}</span><input id="bespoke-name" autoComplete="name" value={brief.name} onChange={(e) => set("name", e.target.value)} required maxLength={100} /></label>
                <label className={styles.field} htmlFor="bespoke-phone"><span>{say("رقم الهاتف", "Phone number")}</span><input id="bespoke-phone" type="tel" dir="ltr" autoComplete="tel" inputMode="tel" placeholder="+971 50 123 4567" value={brief.phone} onChange={(e) => set("phone", e.target.value)} required minLength={8} maxLength={24} /><small>{say("أضف رمز الدولة إذا كان رقمك من خارج الإمارات.", "Include your country code if your number is outside the UAE.")}</small></label>
                </div>
                <fieldset className={styles.fieldset}><legend>{say("كيف تفضّل أن نتواصل معك؟", "How would you like us to contact you?")}</legend><div className={styles.pieceOptions}>{[{ id: "whatsapp", ar: "واتساب", en: "WhatsApp" }, { id: "email", ar: "البريد الإلكتروني", en: "Email" }].map((method) => <label className={styles.choice} key={method.id}><input type="radio" name="contactMethod" checked={brief.contactMethod === method.id} onChange={() => set("contactMethod", method.id)} /><span>{method[locale]}</span></label>)}</div></fieldset>
                <div className={styles.contactFields}>
                <label className={styles.field} htmlFor="bespoke-email"><span>{say("البريد الإلكتروني", "Email address")}{brief.contactMethod !== "email" && <em>{say("اختياري", "Optional")}</em>}</span><input id="bespoke-email" type="email" dir="ltr" autoComplete="email" value={brief.email} onChange={(e) => set("email", e.target.value)} required={brief.contactMethod === "email"} maxLength={180} /></label>
                <label className={styles.field} htmlFor="bespoke-emirate"><span>{say("الإمارة", "Emirate")}<em>{say("اختياري", "Optional")}</em></span><select id="bespoke-emirate" value={brief.emirate} onChange={(e) => set("emirate", e.target.value)}><option value="">{say("اختر الإمارة", "Select an emirate")}</option>{EMIRATES.map((emirate) => <option key={emirate.key} value={emirate.key}>{emirate[locale]}</option>)}</select></label>
                </div>
                <details open className={styles.summary}><summary>{say("ملخص طلبك", "Your request at a glance")}<ChevronDown size={16} /></summary><dl><dt>{say("القطعة", "Piece")}</dt><dd>{optionLabel(PIECES, brief.piece, locale)}</dd><dt>{say("الميزانية", "Budget")}</dt><dd>{optionLabel(BUDGETS, brief.budget, locale)}</dd>{brief.occasion && <><dt>{say("المناسبة", "Occasion")}</dt><dd>{brief.occasion}</dd></>}{brief.desiredDate && <><dt>{say("الموعد المطلوب", "Requested date")}</dt><dd>{brief.desiredDate}</dd></>}</dl><p>{brief.idea}</p>{images.length > 0 && <small>{say(`${images.length} صور مرفقة`, `${images.length} attached images`)}</small>}<button type="button" onClick={() => moveTo(0)}>{say("تعديل الفكرة", "Edit your idea")}</button></details>
                <label className={styles.consent}><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required /><span>{say("أوافق على التواصل معي بخصوص هذا الطلب، واطّلعت على ", "I agree to be contacted about this request and have read the ")}<Link href="/policies?tab=privacy" target="_blank">{say("سياسة الخصوصية", "privacy policy")}</Link>.</span></label>
              </>}
              {error && <p className={styles.error} role="alert">{error}</p>}
              <div className={styles.formFooter}>{step > 0 && <button type="button" className={styles.back} onClick={() => moveTo(step - 1)} disabled={sending}><BackArrow size={17} />{say("السابق", "Back")}</button>}<button type="submit" className={styles.primary} disabled={sending || processing}>{sending ? <LoaderCircle className={styles.spinner} size={17} /> : step === 2 ? <Send size={16} /> : null}{sending ? say("نرسل فكرتك…", "Sending your idea…") : step === 2 ? say("إرسال طلبي الخاص", "Send my private request") : step === 0 ? say("التالي: التفضيلات", "Next: preferences") : say("التالي: التواصل", "Next: contact")}{step < 2 && <Arrow size={17} />}</button></div>
              <p className={styles.noCommitment}>{say("بدون دفع الآن · بدون التزام بالشراء", "No payment now · No commitment to buy")}</p>
            </form>
          </>}
        </div>
      </section>
      <section className={styles.faq} aria-labelledby="bespoke-faq"><div><p className={styles.eyebrow}>{say("قبل أن تبدأ", "Before you begin")}</p><h2 id="bespoke-faq">{say("قد تتساءل…", "You might be wondering…")}</h2></div><div>{[
        [say("هل أحتاج إلى رسمة أو تصميم جاهز؟", "Do I need a sketch or a finished design?"), say("لا. يمكنك البدء بفكرة بسيطة أو معنى تريد التعبير عنه. سنناقش معك الخيارات وما يمكن تنفيذه.", "No. You can start with a simple idea or something meaningful to you. We'll discuss your options and what's possible.")],
        [say("هل سيشاهد أحد طلبي أو صوري؟", "Can anyone else see my request or images?"), say("طلبك وصورك متاحة لفريق مشاعر فقط. لا تُعرض للزوار أو للعملاء الآخرين، ولا تتحول إلى منتج منشور في المتجر.", "Only the Mashaer team can access your request and images. They aren't shown to visitors or other customers, or published as a shop product.")],
        [say("متى أعرف السعر وموعد الاستلام؟", "When will I know the price and delivery date?"), say("بعد مراجعة الفكرة والتواصل معك. نوضّح التصميم والخامة والسعر والمدة وشروط الدفع قبل أن توافق على التنفيذ.", "After reviewing your idea and speaking with you. We explain the design, material, price, timing and payment terms before you approve production.")],
      ].map(([question, answer]) => <details key={question}><summary>{question}<Plus size={17} /></summary><p>{answer}</p></details>)}</div></section>
    </div>
  );
}
