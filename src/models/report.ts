export interface Finding { site:string; type:string; size_mm:{long:string; short:string}; margins:string; density:string; additional:string[] }
export interface ReportData {
  modality:string; studyArea:string;
  patient:{age:string; sex:string; id:string};
  indication:string; technique:string[];
  findings:Finding[]; ancillary:string[];
  comparison:{priorDate:string; change:string};
  impression:string[]; recommendations:string[];
}
export const makeDefault = (studyArea:string): ReportData => ({
  modality:"CT", studyArea,
  patient:{age:"",sex:"",id:""},
  indication:"", technique:["Multislice","Sem contraste"],
  findings:[{ site:"", type:"Nódulo", size_mm:{long:"",short:""}, margins:"regulares", density:"sólido", additional:[] }],
  ancillary:[], comparison:{priorDate:"", change:"estável"}, impression:[""], recommendations:[""],
});
