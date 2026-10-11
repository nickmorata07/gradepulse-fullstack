export function calculateForecast(course, scenario = 85) {
 const rows=(course.categories||[]).map(c=>{const a=c.assessments||[];const possible=a.reduce((s,x)=>s+Number(x.max_score),0);return {...c,average:possible?a.reduce((s,x)=>s+Number(x.score),0)/possible*100:null}})
 const totalWeight=rows.reduce((s,c)=>s+Number(c.weight_percentage),0), valid=Math.abs(totalWeight-100)<0.001
 const completed=rows.filter(c=>c.is_complete===true && c.average!==null)
 const earned=completed.reduce((s,c)=>s+c.average*Number(c.weight_percentage)/100,0)
 const remaining=100-completed.reduce((s,c)=>s+Number(c.weight_percentage),0)
 const graded=rows.filter(c=>c.average!==null),weight=graded.reduce((s,c)=>s+Number(c.weight_percentage),0)
 const pace=weight?graded.reduce((s,c)=>s+c.average*Number(c.weight_percentage),0)/weight:null
 return {rows,totalWeight,valid,earned,remaining,pace,required:valid&&remaining>0?(Number(course.target_grade)-earned)*100/remaining:null,projected:valid&&pace!==null?earned+remaining*pace/100:null,scenario:valid?earned+remaining*scenario/100:null,maximum:valid?earned+remaining:null}
}
export function gradesCSV(course){
 const cell=v=>{let s=String(v??'');if(/^[=+@\-\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"'}
 const rows=[['Course','Category','Weight %','Complete','Assessment','Earned','Possible'],...(course.categories||[]).flatMap(c=>(c.assessments||[]).map(a=>[course.course_code,c.category_name,c.weight_percentage,!!c.is_complete,a.item_name,a.score,a.max_score]))]
 return '\ufeff'+rows.map(r=>r.map(cell).join(',')).join('\r\n')
}
