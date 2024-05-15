importScripts("https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js");

function sendPatch(patch, buffers, msg_id) {
  self.postMessage({
    type: 'patch',
    patch: patch,
    buffers: buffers
  })
}

async function startApplication() {
  console.log("Loading pyodide!");
  self.postMessage({type: 'status', msg: 'Loading pyodide'})
  self.pyodide = await loadPyodide();
  self.pyodide.globals.set("sendPatch", sendPatch);
  console.log("Loaded!");
  await self.pyodide.loadPackage("micropip");
  const env_spec = ['https://cdn.holoviz.org/panel/wheels/bokeh-3.4.1-py3-none-any.whl', 'https://cdn.holoviz.org/panel/1.4.2/dist/wheels/panel-1.4.2-py3-none-any.whl', 'pyodide-http==0.2.1', 'hvplot', 'numpy', 'pandas']
  for (const pkg of env_spec) {
    let pkg_name;
    if (pkg.endsWith('.whl')) {
      pkg_name = pkg.split('/').slice(-1)[0].split('-')[0]
    } else {
      pkg_name = pkg
    }
    self.postMessage({type: 'status', msg: `Installing ${pkg_name}`})
    try {
      await self.pyodide.runPythonAsync(`
        import micropip
        await micropip.install('${pkg}');
      `);
    } catch(e) {
      console.log(e)
      self.postMessage({
	type: 'status',
	msg: `Error while installing ${pkg_name}`
      });
    }
  }
  console.log("Packages loaded!");
  self.postMessage({type: 'status', msg: 'Executing code'})
  const code = `
  \nimport asyncio\n\nfrom panel.io.pyodide import init_doc, write_doc\n\ninit_doc()\n\nfrom panel import state as _pn__state\nfrom panel.io.handlers import CELL_DISPLAY as _CELL__DISPLAY, display, get_figure as _get__figure\n\nimport pandas as pd\nimport numpy as np\nimport panel as pn\npn.extension('tabulator')\n\nimport hvplot.pandas\n# cache the csv data\nif 'data' not in pn.state.cache.keys():\n\n    df = pd.read_csv('https://raw.githubusercontent.com/owid/energy-data/master/owid-energy-data.csv')\n\n    pn.state.cache['data'] = df.copy()\n\nelse: \n\n    df = pn.state.cache['data']\n\ndf = df[df["year"] >= 1980]\ndf = df[df["year"] < 2023]\ncontinents = ['World', 'Asia', 'Oceania', 'Europe', 'Africa', 'North America', 'South America', 'Antarctica']\n# df = df[df["country"].isin(continents)]\n_pn__state._cell_outputs['28c34f25-8c33-4b36-9597-a876d2e9c02a'].append((df))\nfor _cell__out in _CELL__DISPLAY:\n    _pn__state._cell_outputs['28c34f25-8c33-4b36-9597-a876d2e9c02a'].append(_cell__out)\n_CELL__DISPLAY.clear()\n_fig__out = _get__figure()\nif _fig__out:\n    _pn__state._cell_outputs['28c34f25-8c33-4b36-9597-a876d2e9c02a'].append(_fig__out)\n\n_pn__state._cell_outputs['bf78b9c7-2ceb-410a-ba9c-e668d41587db'].append("""## (0) Data preprocessing""")\n# Fill NAs with 0s and create GDP per capita column\ndf = df.fillna(0)\ndf['gdp_per_capita'] = np.where(df['population']!= 0, df['gdp']/ df['population'], 0)\n# Make DataFrame Pipeline Interactive\nidf = df.interactive()\n_pn__state._cell_outputs['54629e7a-8cb8-4fbe-a616-6481a8e6ff31'].append("""## (1) Energy consumption over time by continent""")\n# Define Panel widgets\nyear_slider = pn.widgets.IntSlider(name='Year slider', start=1980, end=2022, step=1, value=2020)\n_pn__state._cell_outputs['b81a227b-996c-4eec-8dd0-4968831b9eb9'].append((year_slider))\nfor _cell__out in _CELL__DISPLAY:\n    _pn__state._cell_outputs['b81a227b-996c-4eec-8dd0-4968831b9eb9'].append(_cell__out)\n_CELL__DISPLAY.clear()\n_fig__out = _get__figure()\nif _fig__out:\n    _pn__state._cell_outputs['b81a227b-996c-4eec-8dd0-4968831b9eb9'].append(_fig__out)\n\n# Radio buttons for Energy Consumption\nyaxis_energy = pn.widgets.RadioButtonGroup(\n    name='Y axis', \n    options=['primary_energy_consumption', 'energy_per_capita',],\n    button_type='success'\n)\nenergy_pipeline = (\n    idf[\n        (idf.year <= year_slider) &\n        (idf.country.isin(continents))\n    ]\n    .groupby(['country', 'year'])[yaxis_energy].mean()\n    .to_frame()\n    .reset_index()\n    .sort_values(by='year')  \n    .reset_index(drop=True)\n)\n_pn__state._cell_outputs['ad349aaf-1612-4a0d-9303-3a379cf83fad'].append((energy_pipeline))\nfor _cell__out in _CELL__DISPLAY:\n    _pn__state._cell_outputs['ad349aaf-1612-4a0d-9303-3a379cf83fad'].append(_cell__out)\n_CELL__DISPLAY.clear()\n_fig__out = _get__figure()\nif _fig__out:\n    _pn__state._cell_outputs['ad349aaf-1612-4a0d-9303-3a379cf83fad'].append(_fig__out)\n\nenergy_plot = energy_pipeline.hvplot(x = 'year', by='country', y=yaxis_energy,line_width=2, title="energy consumption by continent")\n_pn__state._cell_outputs['96b7ed90-92db-41b2-a2ab-ea80aa34d2db'].append((energy_plot))\nfor _cell__out in _CELL__DISPLAY:\n    _pn__state._cell_outputs['96b7ed90-92db-41b2-a2ab-ea80aa34d2db'].append(_cell__out)\n_CELL__DISPLAY.clear()\n_fig__out = _get__figure()\nif _fig__out:\n    _pn__state._cell_outputs['96b7ed90-92db-41b2-a2ab-ea80aa34d2db'].append(_fig__out)\n\n_pn__state._cell_outputs['b2e3cb1b-093c-47ae-b6df-60a0487d0023'].append("""## (2) Table - energy consumption over time by continent """)\nenergy_table = energy_pipeline.pipe(pn.widgets.Tabulator, pagination='remote', page_size = 10, sizing_mode='stretch_width') \n_pn__state._cell_outputs['f9496235-820f-49c8-a375-fbef06be6c1e'].append((energy_table))\nfor _cell__out in _CELL__DISPLAY:\n    _pn__state._cell_outputs['f9496235-820f-49c8-a375-fbef06be6c1e'].append(_cell__out)\n_CELL__DISPLAY.clear()\n_fig__out = _get__figure()\nif _fig__out:\n    _pn__state._cell_outputs['f9496235-820f-49c8-a375-fbef06be6c1e'].append(_fig__out)\n\n_pn__state._cell_outputs['e3483f4a-15d2-4361-9f42-0f0dcf0ac399'].append("""## (3) Energy vs GDP scatterplot""")\nenergy_vs_gdp_scatterplot_pipeline = (\n    idf[\n        (idf.year == year_slider) &\n        (~ (idf.country.isin(continents)))\n    ]\n    .groupby(['country', 'year', 'gdp_per_capita'])['primary_energy_consumption'].mean()\n    .to_frame()\n    .reset_index()\n    .sort_values(by='year')  \n    .reset_index(drop=True)\n)\n_pn__state._cell_outputs['6b00d3dd-3df7-497c-aba8-27ba742223bc'].append((energy_vs_gdp_scatterplot_pipeline))\nfor _cell__out in _CELL__DISPLAY:\n    _pn__state._cell_outputs['6b00d3dd-3df7-497c-aba8-27ba742223bc'].append(_cell__out)\n_CELL__DISPLAY.clear()\n_fig__out = _get__figure()\nif _fig__out:\n    _pn__state._cell_outputs['6b00d3dd-3df7-497c-aba8-27ba742223bc'].append(_fig__out)\n\nenergy_vs_gdp_scatterplot = energy_vs_gdp_scatterplot_pipeline.hvplot(x='gdp_per_capita', \n                                                                y='primary_energy_consumption', \n                                                                by='country', \n                                                                size=20, kind="scatter", \n                                                                alpha=0.7,\n                                                                legend=False, \n                                                                height=500, \n                                                                width=500)\n_pn__state._cell_outputs['da1d4289-2f65-4a94-88fc-841bf3e40068'].append((energy_vs_gdp_scatterplot))\nfor _cell__out in _CELL__DISPLAY:\n    _pn__state._cell_outputs['da1d4289-2f65-4a94-88fc-841bf3e40068'].append(_cell__out)\n_CELL__DISPLAY.clear()\n_fig__out = _get__figure()\nif _fig__out:\n    _pn__state._cell_outputs['da1d4289-2f65-4a94-88fc-841bf3e40068'].append(_fig__out)\n\n_pn__state._cell_outputs['582ad1e4-a76a-4033-b380-bf1a82db634e'].append("""## (4) Bar chart with energy sources by continent""")\nyaxis_energy_source = pn.widgets.RadioButtonGroup(\n    name='Y axis', \n    options=['biofuel_consumption', 'coal_consumption', 'fossil_fuel_consumption', 'gas_consumption', 'hydro_consumption', 'low_carbon_consumption', 'nuclear_consumption', 'solar_consumption', 'wind_consumption'], \n    button_type='success'\n)\n\ncontinents_excl_world = ['Asia', 'Oceania', 'Europe', 'Africa', 'North America', 'South America', 'Antarctica']\n\nenergy_source_bar_pipeline = (\n    idf[\n        (idf.year == year_slider) &\n        (idf.country.isin(continents_excl_world))\n    ]\n    .groupby(['year', 'country'])[yaxis_energy_source].sum()\n    .to_frame()\n    .reset_index()\n    .sort_values(by='year')  \n    .reset_index(drop=True)\n)\nenergy_source_bar_plot = energy_source_bar_pipeline.hvplot(kind='bar', \n                                                     x='country', \n                                                     y=yaxis_energy_source, \n                                                     title='energy source by continent')\n_pn__state._cell_outputs['2c80f1dd-a24d-4342-916c-be7720ee0988'].append((energy_source_bar_plot))\nfor _cell__out in _CELL__DISPLAY:\n    _pn__state._cell_outputs['2c80f1dd-a24d-4342-916c-be7720ee0988'].append(_cell__out)\n_CELL__DISPLAY.clear()\n_fig__out = _get__figure()\nif _fig__out:\n    _pn__state._cell_outputs['2c80f1dd-a24d-4342-916c-be7720ee0988'].append(_fig__out)\n\n_pn__state._cell_outputs['ef1d523e-0409-4024-9783-2b654b8f9d53'].append("""## Creating Dashboard""")\n#Layout using Template\ntemplate = pn.template.FastListTemplate(\n    title='World Energy Dashboard', \n    \n    main=[pn.Row(pn.Column(yaxis_energy,energy_table.panel(width=500),energy_plot.panel(width=600), margin=(0,25))), \n          pn.Row(pn.Column(energy_vs_gdp_scatterplot.panel(width=600), margin=(0,25)),pn.Column(yaxis_energy_source, energy_source_bar_plot.panel(width=600)))],\n    sidebar=[pn.pane.Markdown("# Energy Consumption"), \n             pn.pane.Markdown("#### "), \n             pn.pane.Markdown("## Settings"),   \n             year_slider],\n    accent_base_color="#FFC300",\n    header_background="#85C1E9",\n)\n# template.show()\ntemplate.servable();\n\nawait write_doc()
  `

  try {
    const [docs_json, render_items, root_ids] = await self.pyodide.runPythonAsync(code)
    self.postMessage({
      type: 'render',
      docs_json: docs_json,
      render_items: render_items,
      root_ids: root_ids
    })
  } catch(e) {
    const traceback = `${e}`
    const tblines = traceback.split('\n')
    self.postMessage({
      type: 'status',
      msg: tblines[tblines.length-2]
    });
    throw e
  }
}

self.onmessage = async (event) => {
  const msg = event.data
  if (msg.type === 'rendered') {
    self.pyodide.runPythonAsync(`
    from panel.io.state import state
    from panel.io.pyodide import _link_docs_worker

    _link_docs_worker(state.curdoc, sendPatch, setter='js')
    `)
  } else if (msg.type === 'patch') {
    self.pyodide.globals.set('patch', msg.patch)
    self.pyodide.runPythonAsync(`
    from panel.io.pyodide import _convert_json_patch
    state.curdoc.apply_json_patch(_convert_json_patch(patch), setter='js')
    `)
    self.postMessage({type: 'idle'})
  } else if (msg.type === 'location') {
    self.pyodide.globals.set('location', msg.location)
    self.pyodide.runPythonAsync(`
    import json
    from panel.io.state import state
    from panel.util import edit_readonly
    if state.location:
        loc_data = json.loads(location)
        with edit_readonly(state.location):
            state.location.param.update({
                k: v for k, v in loc_data.items() if k in state.location.param
            })
    `)
  }
}

startApplication()