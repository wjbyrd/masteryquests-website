// Authored amounts and copy for physical documents. No DOM or puzzle mutations.
export const PAY_STUBS=[
 {month:'March',day:31,hours:160,gross:3600,deductions:600,net:3000,note:'Pay period closed.'},
 {month:'April',day:30,hours:160,gross:3800,deductions:600,net:3200,note:'Wage adjustment effective April.'}
];
export const GROCERY_RECEIPTS=[
 {date:'March 30',total:600,items:[['12 × grain & bread',180],['8 × milk & eggs',120],['10 × produce',180],['4 × household goods',120]]},
 {date:'April 30',total:800,items:[['12 × grain & bread',240],['8 × milk & eggs',160],['10 × produce',240],['4 × household goods',160]]}
];
export const HOUSEHOLD_BILLS=[
 {kind:'bill',brand:'ALDER COURT',account:'Property office · Unit 4',title:'Rent notice',rows:[['March','$1,400'],['April','$1,500']],stamp:'DUE ON THE FIRST',note:'Same rooms.'},
 {kind:'utility',brand:'NORTH GRID',account:'Customer 047 · Meter 816',title:'Utility account',rows:[['March · 500 units','$200'],['April · 500 units','$500']],stamp:'ACTUAL METER READ',note:'Same use.'}
];
export const BUDGET_SLIPS=[
 {id:'march:0',source:'pay',month:'March',label:'Net pay',value:3000}, {id:'april:0',source:'pay',month:'April',label:'Net pay',value:3200},
 {id:'march:1',source:'bills',month:'March',label:'Rent',value:1400}, {id:'april:1',source:'bills',month:'April',label:'Rent',value:1500},
 {id:'march:2',source:'food',month:'March',label:'Groceries',value:600}, {id:'april:2',source:'food',month:'April',label:'Groceries',value:800},
 {id:'march:3',source:'bills',month:'March',label:'Utilities',value:200}, {id:'april:3',source:'bills',month:'April',label:'Utilities',value:500}
];
export const PAPER_COPY={
 production:{brand:'ALDER WORKS / DISPATCH',number:'FORM P-21',foot:'Customer orders: still available.'},
 national:{brand:'NATIONAL STATISTICAL REGISTER',number:'MATCHED MONTHLY PERIODS',foot:'Output: constant prices. Inflation: equal monthly intervals.'},
 index:{brand:'ARCHIVE / RECEIVER INDEX',number:'SERVICE COPY',foot:'First dispatch: employee notice. Later dispatches: emergency invoices.'},
 stock:{brand:'ALDER WORKS / STORES',number:'BIN 06',foot:'Unused input may be stored. Accept only jobs worth their added costs.'}
};
