# Bloques de subtítulos hechos a mano (≤5 palabras / 24 car.). *palabra = clave en naranja.
import json
B = """Esta empresa *mexicana
está *ayudando
a que muchas empresas
no *quiebren
Es una empresa de *IA
para *finanzas
y esto es
lo que *resuelven
Tu *contabilidad dice
que ganas una cosa
la *realidad puede ser
muy *distinta
La *contabilidad de casi
todas las empresas
está hecha para el *SAT
para pagar *impuestos
no para *decidir
No cuenta el *efectivo
que no facturas
*mezcla los gastos
de los *socios
con los del negocio
y registra como un *gasto
lo que en realidad es
una *inversión
El resultado es que
no sabes cuánto *ganas
de *verdad
Y esta *startup
que se llama *Monthly
se presenta como
el primer *CFO
con inteligencia
*artificial
para empresas en *México
Se *conecta al sistema
contable que ya usas
sin cambiar de *contador
con *IA y un asesor
primero *audita
encuentra registros
*duplicados y operaciones
*incompletas
Luego los *limpia
separa lo de los *socios
y acomoda
las *inversiones
y *24 horas después
de cada *cierre
tienes tus estados
financieros *reales
Más de *50 indicadores
y hasta le puedes
*preguntar a tus números
en *español
Sí, así como
si estuvieras utilizando
*ChatGPT
pero con todo tu
contexto *financiero
Un caso *real
es que una empresa
de *transporte descubrió
que el *75%
de su volumen venía
de solo dos *clientes
Así están usando la *IA
los negocios que van
*adelante
no para hacer
más *reportes
sino para por fin
tener *visibilidad
Si todavía no sabes
cómo implementar *IA
en tu negocio
esta *cuenta es para ti"""
r = json.load(open('reels/monthly/reel.json'))
P = r['palabras']; i = 0; subs = []
norm = lambda s: s.strip('.,;:¿?¡!').lower()
for linea in B.split('\n'):
    ws = linea.split(); words = []
    for w in ws:
        key = w.startswith('*'); w = w.lstrip('*')
        p = P[i]; assert norm(p['w']) == norm(w), (p['w'], w, i)
        words.append({'w': w.rstrip(',.'), **({'key': True} if key else {}), 'start': p['start']}); i += 1
    assert len(linea.replace('*','')) <= 24, linea
    subs.append({'start': words[0]['start'], 'end': P[i-1]['end'], 'words': words})
assert i == len(P), (i, len(P))
for a, b in zip(subs, subs[1:]):
    a['end'] = round(min(b['start'], max(a['end'] + 0.25, a['end'])), 3) if b['start'] - a['end'] < 0.6 else round(a['end'] + 0.3, 3)
subs[-1]['end'] = r['duracion']
r['subs'] = subs
json.dump(r, open('reels/monthly/reel.json', 'w'), ensure_ascii=False, indent=2)
print(len(subs), 'bloques')
