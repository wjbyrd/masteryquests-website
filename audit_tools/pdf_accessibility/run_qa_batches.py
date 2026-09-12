"""Resume only the 80 source-authorized QA resources, checkpointing each batch."""
import qa_remediation as q
import batch_candidates as b

def main():
    b.RUN=q.RUN;b.TASK_ID='CONCEPT_REVIEW_QA_REMEDIATION_V1'
    rows=q.read_json(q.EVIDENCE+'/dispositions.json')
    batches=[('batch1_high',[r['code'] for r in rows if r['changed'] and r['priority']=='HIGH'])]
    for domain in ['GEN-ECON','MICRO','MACRO']:
        codes=[r['code'] for r in rows if r['changed'] and r['priority']!='HIGH' and r['code'].rsplit('-',1)[0]==domain]
        for start in range(0,len(codes),15):batches.append((domain.lower().replace('-','_')+'_'+str(start//15+1),codes[start:start+15]))
    for name,codes in batches:
        print('BATCH',name,flush=True)
        results=b.run(name,codes)
        if any(r['result']=='BLOCKED' for r in results):raise RuntimeError('Required gate failed: '+name)
    print('All 80 candidates machine-validated; visual review still required.',flush=True)

if __name__=='__main__':main()
