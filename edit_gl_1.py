import re

path = r"gestion_lieux.html"
with open(path, encoding="utf-8") as f:
    content = f.read()

orig = content

# Point 1: exclude repere from "terminer tournee" rappel proposal
old1 = "const restants = (ST.currentTourneeStops||[]).filter(s => s.statut === 'a_faire');"
new1 = "const restants = (ST.currentTourneeStops||[]).filter(s => s.statut === 'a_faire' && !isRepere(s));"
assert content.count(old1) == 1, f"old1 count={content.count(old1)}"
content = content.replace(old1, new1)

# Point 2: show comment text instead of icon+tooltip in stop list
old2 = '''        ${s.commentaire_distributeur?`<span style="font-size:12px;margin-right:2px" title="${esc(s.commentaire_distributeur)}">\U0001F4AC</span>`:''}'''
assert content.count(old2) == 1, f"old2 count={content.count(old2)}"
content = content.replace(old2, "")  # remove the icon-only span; text version added into stop-info below

old2b = '''        <div class="stop-info" style="cursor:pointer" onclick="openStopDetail(${s.id})" title="Voir ce qui a été réalisé"><div class="stop-nom">${esc(s.lieu?.nom||'?')}</div>
          ${isLivraisonOnly
            ? `<div class="stop-addr" style="color:#C87F0A;font-weight:600">\U0001F4E6 ${esc(desc||'Livraison')}</div>`
            : `<div class="stop-addr">${esc(s.lieu?.ville||s.lieu?.adresse||'')}</div>${hasCommande?`<div class="stop-addr" style="color:#C87F0A;font-weight:600">\U0001F4E6 ${esc(desc||'Livraison')}${livDone?' ✓':''}</div>`:''}`}
        </div>'''
new2b = '''        <div class="stop-info" style="cursor:pointer" onclick="openStopDetail(${s.id})" title="Voir ce qui a été réalisé"><div class="stop-nom">${esc(s.lieu?.nom||'?')}</div>
          ${isLivraisonOnly
            ? `<div class="stop-addr" style="color:#C87F0A;font-weight:600">\U0001F4E6 ${esc(desc||'Livraison')}</div>`
            : `<div class="stop-addr">${esc(s.lieu?.ville||s.lieu?.adresse||'')}</div>${hasCommande?`<div class="stop-addr" style="color:#C87F0A;font-weight:600">\U0001F4E6 ${esc(desc||'Livraison')}${livDone?' ✓':''}</div>`:''}`}
          ${s.commentaire_distributeur?`<div class="stop-addr" style="font-style:italic">\U0001F4AC ${esc(s.commentaire_distributeur)}</div>`:''}
        </div>'''
assert content.count(old2b) == 1, f"old2b count={content.count(old2b)}"
content = content.replace(old2b, new2b)

# Point 6: repere badge emoji flag -> house
old6 = '<span class="badge" style="background:#ECEFF1;color:#607D8B">\U0001F6A9 Repère</span>'
assert content.count(old6) == 1, f"old6 count={content.count(old6)}"
content = content.replace(old6, '<span class="badge" style="background:#ECEFF1;color:#607D8B">\U0001F3E0 Repère</span>')

# also the other 🚩 line in gestion_lieux.html
old6b = "🚩 Point de repère (départ/arrivée) — sert uniquement au calcul de l'itinéraire, non soumis à validation"
assert content.count(old6b) == 1, f"old6b count={content.count(old6b)}"
content = content.replace(old6b, "🏠 Point de repère (départ/arrivée) — sert uniquement au calcul de l'itinéraire, non soumis à validation")

assert content != orig
with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("OK, len diff:", len(content)-len(orig))
