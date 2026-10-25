(function(root){
  'use strict';
  const limits={fileBytes:25*1024*1024,expandedBytes:128*1024*1024,entries:20000,cells:2000000,rows:100000,columns:512};
  // Inspect the ZIP directory before decompression. Never extract files to disk.
  function inspectArchive(buffer,extension){
    const bytes=new Uint8Array(buffer),view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
    if(!bytes.length)throw Error('This document is empty.');
    if(bytes.length>limits.fileBytes)throw Error('This document exceeds the 25 MB local import limit.');
    if(bytes.length<22||view.getUint32(0,true)!==0x04034b50)throw Error('This is not a genuine '+(extension==='numbers'?'Apple Numbers':'Excel')+' document. Renaming a CSV does not convert it.');
    let end=-1;
    for(let i=bytes.length-22;i>=Math.max(0,bytes.length-65557);i--)if(view.getUint32(i,true)===0x06054b50&&i+22+view.getUint16(i+20,true)===bytes.length){end=i;break;}
    if(end<0)throw Error('The document archive is incomplete or damaged.');
    const count=view.getUint16(end+10,true),size=view.getUint32(end+12,true),offset=view.getUint32(end+16,true);
    if(view.getUint16(end+4,true)||view.getUint16(end+6,true)||count===65535||count>limits.entries||offset+size>end)throw Error('This document uses an unsupported or oversized archive structure.');
    let cursor=offset,total=0;const names=new Set(),decoder=new TextDecoder();
    for(let i=0;i<count;i++){
      if(cursor+46>end||view.getUint32(cursor,true)!==0x02014b50)throw Error('The document archive directory is damaged.');
      const flags=view.getUint16(cursor+8,true),method=view.getUint16(cursor+10,true),length=view.getUint16(cursor+28,true),extra=view.getUint16(cursor+30,true),comment=view.getUint16(cursor+32,true);
      if(flags&1)throw Error('Password-protected documents are not supported. Use the original game CSV.');
      if(![0,8].includes(method))throw Error('This document uses unsupported ZIP compression.');
      total+=view.getUint32(cursor+24,true);
      if(total>limits.expandedBytes)throw Error('This document exceeds the 128 MB expanded-data limit.');
      if(cursor+46+length+extra+comment>end)throw Error('The document archive directory is damaged.');
      const name=decoder.decode(bytes.subarray(cursor+46,cursor+46+length));
      const local=view.getUint32(cursor+42,true),packed=view.getUint32(cursor+20,true);
      if(local+30>offset||view.getUint32(local,true)!==0x04034b50)throw Error('The document archive entry is damaged.');
      const dataStart=local+30+view.getUint16(local+26,true)+view.getUint16(local+28,true);
      if(dataStart+packed>offset||view.getUint16(local+8,true)!==method||view.getUint16(local+6,true)!==flags)throw Error('The document archive entry is inconsistent.');
      if(!(flags&8)&&(view.getUint32(local+18,true)!==packed||view.getUint32(local+22,true)!==view.getUint32(cursor+24,true)))throw Error('The document archive entry sizes are inconsistent.');
      if(names.has(name))throw Error('The document contains duplicate archive entries.');
      names.add(name);cursor+=46+length+extra+comment;
    }
    if(cursor!==offset+size)throw Error('The document archive directory is damaged.');
    if(extension==='numbers'&&!names.has('Index/Document.iwa'))throw Error('This Numbers document is encrypted, uses the older Numbers ’09 format, or lacks its table archive. Modern, unencrypted Numbers documents are supported.');
    if(extension==='xlsx'&&!names.has('xl/workbook.xml'))throw Error('This is not a supported .xlsx workbook.');
    return {entries:count,expandedBytes:total};
  }
  const blank=cell=>!cell||!cell.f&&!cell.F&&(cell.t==='z'||cell.v==null||cell.v==='');
  function value(cell,address){
    if(blank(cell))return '';
    if(cell.f||cell.F)throw Error(address+': formulas are not supported in telemetry tables. Use original recorded values.');
    if(cell.t==='e')throw Error(address+': a spreadsheet error replaces a telemetry value.');
    if(cell.t==='d'||cell.v instanceof Date)throw Error(address+': a spreadsheet date replaces the original timestamp. Its original text and timezone cannot be recovered; use the original game CSV.');
    if(typeof cell.v==='string')return cell.v;
    if(typeof cell.v==='boolean')return String(cell.v);
    if(typeof cell.v==='number'){
      if(!Number.isFinite(cell.v)||Number.isInteger(cell.v)&&!Number.isSafeInteger(cell.v))throw Error(address+': a numeric value exceeds exact supported precision. Store long identifiers as text or use the original game CSV.');
      return String(cell.v);
    }
    throw Error(address+': unsupported telemetry cell type.');
  }
  const signatures=[['event','runID','game','correct'],['event_type','run_id','game_id','correct']];
  function isTelemetry(headers){
    return signatures.some(keys=>keys.every(k=>headers.includes(k)))&&
      ['questionID','question_id','answerSnapshotJSON','extras_json'].some(k=>headers.includes(k))&&
      ['responseTimeMs','response_time_ms'].some(k=>headers.includes(k));
  }
  function extractTables(workbook,XLSX){
    const tables=[],ignored=[];let cells=0;
    for(const name of workbook.SheetNames){
      const sheet=workbook.Sheets[name];
      if(!sheet?.['!ref']){ignored.push(name+' (empty)');continue;}
      const range=XLSX.utils.decode_range(sheet['!ref']);
      const height=range.e.r-range.s.r+1,width=range.e.c-range.s.c+1;
      cells+=height*width;
      if(height>limits.rows||width>limits.columns||cells>limits.cells)throw Error('The workbook exceeds the local table limit (100,000 rows, 512 columns, or 2 million cells).');
      const at=(r,c)=>sheet[XLSX.utils.encode_cell({r,c})];
      let headerRow=-1,headers=[],columns=[];
      for(let r=range.s.r;r<=Math.min(range.e.r,range.s.r+49);r++){
        const labels=[];for(let c=range.s.c;c<=range.e.c;c++)labels.push(typeof at(r,c)?.v==='string'?at(r,c).v:'');
        if(!labels.includes('event')&&!labels.includes('event_type'))continue;
        if(!isTelemetry(labels)){
          if(signatures.some(keys=>keys.slice(1).filter(k=>labels.includes(k)).length>=2)||labels.includes('runID')||labels.includes('run_id'))throw Error(name+': telemetry header is missing required event, run, game, correctness, question/snapshot, or response-time columns.');
          continue; // An unrelated calendar or summary can also have an "event" column.
        }
        headerRow=r;
        for(let c=range.s.c;c<=range.e.c;c++){
          const label=value(at(r,c),name+' header');
          if(!label){
            for(let rr=r+1;rr<=range.e.r;rr++)if(!blank(at(rr,c)))throw Error(name+': a populated column has no telemetry header.');
            continue;
          }
          if(headers.includes(label)||['__proto__','constructor','prototype','__sourceFile'].includes(label))throw Error(name+': duplicate or reserved column name '+label+'.');
          headers.push(label);columns.push(c);
        }
        break;
      }
      if(headerRow<0){ignored.push(name+' (no telemetry header in first 50 rows)');continue;}
      if(sheet['!merges']?.some(m=>m.e.r>=headerRow))throw Error(name+': merged telemetry cells are not supported.');
      const rows=[];
      for(let r=headerRow+1;r<=range.e.r;r++){
        if(columns.every(c=>blank(at(r,c))))continue;
        const values=columns.map((c,i)=>{
          const cell=at(r,c),address=name+'!'+XLSX.utils.encode_cell({r,c});
          if(/(?:ID|_id)$/.test(headers[i])&&cell?.t==='n'&&cell.z&&!['General','0'].includes(cell.z))throw Error(address+': a formatted numeric identifier cannot be imported faithfully. Use a text identifier or the original game CSV.');
          return value(cell,address);
        });
        if(values.some(v=>v==='event'||v==='event_type')&&isTelemetry(values))throw Error(name+': multiple telemetry blocks share a worksheet. Put each table on its own worksheet.');
        rows.push(Object.fromEntries(headers.map((h,i)=>[h,values[i]])));
      }
      if(!rows.length){ignored.push(name+' (telemetry header only)');continue;}
      tables.push({name,headers,rows});
    }
    if(!tables.length)throw Error('No recognizable telemetry table with data was found. Expected event, run, game, correctness, question/snapshot, and response-time columns. '+ignored.join('; '));
    return {tables,ignored};
  }
  function parse(buffer,extension,XLSX){
    inspectArchive(buffer,extension);
    let workbook;
    try{workbook=XLSX.read(buffer,{type:'array',raw:true,cellDates:true,cellNF:true,cellText:false,cellHTML:false,cellFormula:true,nodim:true,WTF:true});}
    catch(error){throw Error('Unable to read this '+(extension==='numbers'?'Apple Numbers':'Excel')+' document. It may be damaged, encrypted, or use an unsupported version. '+error.message);}
    return extractTables(workbook,XLSX);
  }
  const api={limits,inspectArchive,extractTables,parse};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.MQWorkbookImport=api;
})(globalThis);
