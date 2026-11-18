import{c as t}from"./index-B_eHU272.js";/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const h=t("AlertTriangle",[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z",key:"c3ski4"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y=t("Download",[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"7 10 12 15 17 10",key:"2ggqvy"}],["line",{x1:"12",x2:"12",y1:"15",y2:"3",key:"1vk2je"}]]);class s{getApiUrl(){return typeof window<"u"&&window.location.hostname!=="localhost"?"":"http://localhost:4000"}async comparePDFs(e,o,a,n){try{const r=await fetch(`${this.getApiUrl()}/api/grok-compare`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({doc1Title:e,doc1Content:o,doc2Title:a,doc2Content:n})});if(!r.ok){const i=await r.json().catch(()=>({error:"Unknown error"}));throw new Error(i.error||`Server error: ${r.statusText}`)}return await r.json()}catch(r){throw console.error("Error comparing PDFs:",r),r}}async compareValidationDocuments(e,o){return this.comparePDFs("Project Design Document (PDD)",e,"ACVA Validation Report",o)}async compareVerificationDocuments(e,o){return this.comparePDFs("Proponent Claim Report",e,"ACVA Verification Report",o)}}const d=new s;export{h as A,y as D,d as g};
