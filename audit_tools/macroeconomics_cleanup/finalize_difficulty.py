"""Individual final-task review, indexed by immutable sorted Class-D worklist.

The index lists below were assigned after reading all 715 final stems, rather
than copying the audit's suggested tier by family. The saved ledger includes the
exact ID and task reviewed so index drift cannot silently apply a decision.
"""
from author import *
rows=json.loads((WORK/'difficulty_review.json').read_text(encoding='utf8'))
assert [r['id'] for r in rows]==TARGETS['D']
hard=set(map(int,'''1 8 25 28 29 31 33 34 35 37 38 40 41 43 44 45 46 47 48 55 56 61 67 71 72 74 78 81 82 84 88 91 92 93 94 95 96 99 106
143 149 151 152 159 163 164 167 169 174 175 179
180 183 187 188 190 191 192 194 196 198 200 201 203 204 209 210 212 213 215 218 219 220 223 224 225 227 228 229 232 233 239 240 241 242 243 244 245 246 249 250 251 256 265 272 274 290 292 297 299
300 302 304 305 306 307 309 310 311 312 313 314 315 316 319 320 321 323 324 325 326 327 328 329 331 332 334 335 337 338 345 348 349 352 353
361 363 364 368 370 371 375 380 381 383 385 386 388 389 390 391 392 393 404 405 406 407 408 409 410 411 412 413 414 415 417 418 419 420 421 422 425 426 427 428 430 431 434 435 438 439 440 441 446 447 449 452 453 454 455 456 457 458 459 460 461 462 463 464 465 467 469 470 471 473 474 475 476 477 478 479 480 481 482 483 486 487 488 489 490 491 495 497 502 503 504 505 506 507 508 509 510 513 514 516 517 519 520 521 522 524 526 529 532 533 534 535 538 539
546 549 552 557 558 559 561 562 564 566 567 568 570 571 574 576 582 583 587 588 591 592 595 600 601 602 603 604 611 612 613 614 615 616 621 622 623 624 625 626 627 628 629 632 633 635 636 637 640 641 644 649 651 652 653 654 657 659 662 663 664 665 666 667 668 673 679 680 681 682 683 684 685 686 687 688 691 695 696 697 698 700 702 703 706 708 710 711 712 713'''.split()))
easy=set(map(int,'''9 10 15 19 21 24 39 83 85 89 103 104 107 109 112 129 131 134 142 144 147 153 154 155 156 157 160 165 168 172 177 178 205 206 211 252 254 258 266 291 294 295 336 342 343 351 355 362 366 372 373 377 379 394 395 396 398 402 423 436 442 443 444 448 493 494 511 512 515 518 565 578 579 581 584 669 677'''.split()))
elite={523,527,537}
assert not (easy&hard or easy&elite or hard&elite)
ledger={}
for n,row in enumerate(rows):
    id=row['id'];v=q(id)
    assert v['q']==row['q'],f'Reviewed task drift: {id}'
    tier='elite' if n in elite else 'hard' if n in hard else 'easy' if n in easy else 'medium'
    basis={
      'easy':'Recognize the stated definition, category or single conceptual distinction; no inferred intermediate result is required.',
      'medium':'Apply one familiar rule, ratio, directional relation or direct graph reading to the supplied case.',
      'hard':'Select or link relevant rules, reconcile multiple quantities/mechanisms, or interpret a graph with a consequence or condition.',
      'elite':'Evaluate a revised countershock or implementation constraint; distinguish the isolated channel from the net economy-wide result.'}[tier]
    ledger[id]={'reviewIndex':n,'finalTask':v['q'],'oldDifficulty':RECORDS[id]['q'].get('canonicalDifficulty'),'finalDifficulty':tier,'basis':basis}
    patch(id,'Individual Class-D final-task review: '+basis,canonicalDifficulty=tier)
    # Support pool identity and checkpoint role are independent of task demand.
    if v.get('difficulty') in ['easy','medium','hard','elite','legendary']:patch(id,difficulty=tier)
(INPUTS/'difficulty_decisions.json').write_text(json.dumps(ledger,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
save()
