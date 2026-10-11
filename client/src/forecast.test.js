import {test} from 'node:test'
import assert from 'node:assert/strict'
import {calculateForecast,gradesCSV} from './forecast.js'
const cat=(w,s,done=false)=>({weight_percentage:w,is_complete:done,assessments:s===null?[]:[{score:s,max_score:100}]})
const run=(cats,target=90,scenario=90)=>calculateForecast({categories:cats,target_grade:target},scenario)
test('40% at 80 completed needs 96.67 for 90',()=>{const f=run([cat(40,80,true),cat(60,null)]);assert.equal(f.earned,32);assert.ok(Math.abs(f.required-96.6666667)<0.0001);assert.equal(f.scenario,86);assert.equal(f.maximum,92)})
test('partial category is not locked',()=>{const f=run([cat(40,80),cat(60,null)]);assert.equal(f.remaining,100);assert.equal(f.earned,0);assert.equal(f.projected,80)})
test('point totals rather than mean of percentages',()=>{const f=run([{weight_percentage:100,is_complete:true,assessments:[{score:10,max_score:10},{score:0,max_score:90}]}]);assert.equal(f.projected,10)})
test('weights must total 100',()=>{const f=run([cat(50,80)]);assert.equal(f.valid,false);assert.equal(f.required,null);assert.equal(f.projected,null)})
test('empty grades have no pace estimate',()=>{const f=run([cat(100,null)]);assert.equal(f.projected,null);assert.equal(f.required,90)})
test('demo final is 90.2',()=>{const f=run([cat(40,80,true),cat(30,96,true),cat(30,98,true)]);assert.ok(Math.abs(f.projected-90.2)<1e-10);assert.equal(f.required,null)})
test('impossible target remains visible',()=>{const f=run([cat(90,50,true),cat(10,null)]);assert.equal(f.required,450);assert.equal(f.maximum,55)})
test('CSV escapes quotes and spreadsheet formulas',()=>{const text=gradesCSV({course_code:'=1+1',categories:[{category_name:'Quiz "A"',weight_percentage:100,assessments:[{item_name:'=2+2',score:1,max_score:2}]}]});assert.ok(text.includes('"\'=1+1"'));assert.ok(text.includes('"Quiz ""A"""'));assert.ok(text.includes('"\'=2+2"'))})
