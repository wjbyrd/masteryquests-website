from author import *
def candidates(concept):
    locked=set(TARGETS['A']+TARGETS['B']+TARGETS['E']+TARGETS['L'])
    return [i for i in TARGETS['F'] if RECORDS[i]['q']['primaryConceptId']==concept and not RECORDS[i]['q'].get('image') and i not in locked]
def emit(id,stem,answers,feedback,tier='hard',error=None,proof=None,operation='analysis'):
    task(id,stem,answers,feedback,operation,error,proof)
    patch(id,'Checkpoint task adds diagnosis, constrained comparison, reverse inference or a second economic mechanism.',canonicalDifficulty=tier,difficulty=tier)
def proof(*pairs,basis='Recomputed from the student-visible accounting identity; incorrect choices represent specified accounting errors.'):
    return {'expressions':[list(p) for p in pairs],'basis':basis}
