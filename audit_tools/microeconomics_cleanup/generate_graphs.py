"""Deterministic, equation-based corrections for MEA-0107 and MEA-0113.

Writes staged assets only. The consolidated apply step installs reviewed files.
"""
from pathlib import Path
import json, math, sys
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'tmp/microeconomics_cleanup/deps'))
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from PIL import Image

OUT = ROOT / 'tmp/microeconomics_cleanup/graphs'
OUT.mkdir(parents=True, exist_ok=True)
plt.rcParams.update({'font.family': 'DejaVu Sans', 'font.size': 13, 'axes.titlesize': 18})
ledger = []

def chart(title, xmax, ymax):
    fig, ax = plt.subplots(figsize=(11, 7), dpi=120)
    ax.set(xlim=(0, xmax), ylim=(0, ymax), xlabel='Quantity', ylabel='Price / cost per unit ($)', title=title)
    ax.spines[['top', 'right']].set_visible(False)
    ax.grid(alpha=.13)
    return fig, ax

def save(fig, filename):
    fig.tight_layout(pad=1.7)
    png = OUT / filename.replace('.webp', '.png')
    fig.savefig(png, facecolor='white', metadata={'Software': 'Microeconomics mathematical graph generator'})
    plt.close(fig)
    Image.open(png).convert('RGB').save(OUT / filename, 'WEBP', lossless=True, method=6)

for i, (q1, p1, mc1) in enumerate([(20,70,50),(24,76,49.6),(18,64,47.8),(28,82,48.4),(22,68,50.4)], 1):
    d = .5
    fixed = q1*(p1-mc1+d*q1)
    c = mc1-2*d*q1
    slope = (p1-mc1)/q1
    intercept = p1+slope*q1
    q2 = math.sqrt(fixed/d)
    atc = lambda q: fixed/q+c+d*q
    mc = lambda q: c+2*d*q
    demand = lambda q: intercept-slope*q
    mr = lambda q: intercept-2*slope*q
    assert abs(mc(q2)-atc(q2)) < 1e-9
    assert abs(demand(q1)-atc(q1)) < 1e-9
    assert abs(-fixed/q1**2+d+slope) < 1e-9
    assert abs(mr(q1)-mc(q1)) < 1e-9
    assert q2 > q1 and p1 > mc1
    xmax, ymax = q2*1.48, intercept*1.15
    fig, ax = chart('Monopolistic competition: long-run firm outcome', xmax, ymax)
    x = np.linspace(2, xmax, 900)
    ax.plot(x, demand(x), color='#1354a2', lw=2.7, label='D = AR')
    ax.plot(x, mr(x), color='#1354a2', lw=2.2, ls='--', label='MR')
    ax.plot(x, atc(x), color='#a64900', lw=2.7, label='ATC')
    ax.plot(x, mc(x), color='#166c42', lw=2.7, label='MC')
    ax.vlines([q1,q2], 0, [p1,atc(q2)], colors='#555555', linestyles=':', lw=1.3)
    ax.hlines([p1,mc1], 0, q1, colors='#777777', linestyles=':', lw=1.2)
    ax.scatter([q1,q1,q2], [p1,mc1,atc(q2)], color='#222222', s=24, zorder=5)
    ax.annotate(f'P1 = {p1:g}', (q1,p1), xytext=(8,14), textcoords='offset points')
    ax.annotate(f'{mc1:g}', (q1,mc1), xytext=(-32,-19), textcoords='offset points')
    ax.annotate('Q2: minimum ATC', (q2,atc(q2)), xytext=(10,-24), textcoords='offset points', fontsize=11)
    ax.set_xticks([0,q1,q2,round(xmax/10)*10])
    ax.set_xticklabels(['0',f'Q1 = {q1:g}',f'Q2 = {q2:.2f}',str(round(xmax/10)*10)])
    ax.tick_params(axis='x', pad=10)
    ax.legend(loc='upper right', framealpha=1)
    filename = f'mcmp_long_run_{i}.webp'
    save(fig, filename)
    desc = (f'Quantity is horizontal and dollars per unit vertical. D=AR slopes downward and MR lies below it. '
            f'At Q1={q1:g}, D and ATC meet at P1={p1:g}; MR and MC meet at {mc1:g}. '
            f'ATC is U-shaped. MC crosses ATC at its minimum, marked Q2={q2:.2f}.')
    ledger.append({'runtimePath':f'question-assets/monopolistic-competition/{filename}', 'stagedFile':str(OUT/filename),
                   'imageAlt':f'Demand, marginal revenue and cost curves with Q1={q1:g} and Q2={q2:.2f}. See graph description for coordinates.',
                   'graphDescription':desc, 'equations':{'TC':f'{fixed:g}+{c:g}Q+{d:g}Q^2','D':f'{intercept:g}-{slope:g}Q'},
                   'parameters':{'F':fixed,'c':c,'d':d,'a':intercept,'b':slope},
                   'computed':{'Q1':q1,'Q2':q2,'price':p1,'MC':mc1,'markup':p1-mc1,'excessCapacity':q2-q1}, 'findingID':'MEA-0113'})

for i, (qk, pk, upper, lower, cost) in enumerate([(20,60,.5,1.5,40),(30,72,.4,1.2,48)],1):
    au, al = pk+upper*qk, pk+lower*qk
    top, bottom = pk-upper*qk, pk-lower*qk
    assert upper < lower and bottom < cost < top
    fig, ax = chart('Kinked demand and marginal revenue', qk*2, al*1.12)
    xu, xl = np.linspace(0,qk,300), np.linspace(qk,qk*2,300)
    ax.plot(xu,au-upper*xu,color='#1354a2',lw=2.7,label='D')
    ax.plot(xl,al-lower*xl,color='#1354a2',lw=2.7)
    ax.plot(xu,au-2*upper*xu,color='#a64900',lw=2.4,label='MR')
    ax.plot(xl,al-2*lower*xl,color='#a64900',lw=2.4)
    ax.vlines(qk,bottom,top,color='#a64900',linestyles=':',lw=2)
    ax.hlines(cost,0,qk*2,color='#166c42',lw=2.5,label='MC')
    ax.scatter([qk,qk,qk],[pk,top,bottom],s=28,color=['#1354a2','#a64900','#a64900'],zorder=5)
    ax.vlines(qk,0,bottom,color='#777777',linestyles=':',lw=1)
    ax.annotate(f'Kink ({qk:g}, {pk:g})',(qk,pk),xytext=(12,12),textcoords='offset points')
    ax.annotate(f'MR: {top:g}',(qk,top),xytext=(12,4),textcoords='offset points')
    ax.annotate(f'MR: {bottom:g}',(qk,bottom),xytext=(12,-15),textcoords='offset points')
    ax.annotate(f'MC = {cost:g}',(qk*1.6,cost),xytext=(0,8),textcoords='offset points')
    ax.set_xticks([0,qk,qk*2])
    ax.legend(loc='upper right',framealpha=1)
    filename=f'kinked_{i}.webp'
    save(fig,filename)
    ledger.append({'runtimePath':f'question-assets/oligopoly/{filename}', 'stagedFile':str(OUT/filename),
                   'imageAlt':f'Kinked demand at quantity {qk:g}, price {pk:g}, with two MR branches and MC at {cost:g}.',
                   'graphDescription':f'Quantity is horizontal and dollars per unit vertical. Demand follows P={au:g}−{upper:g}Q for Q up to {qk:g}, then P={al:g}−{lower:g}Q for larger Q. At Q={qk:g}, the upper MR branch ends at {top:g} and the lower branch begins at {bottom:g}. MC is horizontal at {cost:g}.',
                   'parameters':{'Qk':qk,'Pk':pk,'upperSlope':upper,'lowerSlope':lower,'MC':cost},
                   'computed':{'upperMR':top,'lowerMR':bottom},'findingID':'MEA-0107'})

(OUT/'manifest.json').write_text(json.dumps(ledger,indent=2),encoding='utf-8')
print(json.dumps({'assets':len(ledger),'algebraicAssertions':'PASS','output':str(OUT)}))
