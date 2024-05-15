# Global Energy Consumption Dashboard

## Overview
This interactive dashboard allows users to explore global energy consumption trends from 1980 to 2022. It provides a dynamic way to visualize long-term trends and analyze changes in energy use across different continents.

## Access
The dashboard can be accessed by visiting [this link](https://tuantuan233.github.io/dashboard/). 
> **Please note that the initial render is quite slow, taking about 1-2 minutes.
> Interactive actions take the dashboard 10-30 seconds to react.**
    
## Deployment
To deploy the notebook as a web app:
1. **Convert the notebook**:
    ```bash
    panel convert index.ipynb --to pyodide-worker
    ```
   This command converts the notebook into a deployable web app (HTML + JS) on the GitHub page.

## Data Source
The data used in this dashboard is sourced from [Our World in Data](https://ourworldindata.org/energy).

## Acknowledgements
Special thanks to the creators of the Panel package and the contributors to Our World in Data for providing the energy consumption data.

