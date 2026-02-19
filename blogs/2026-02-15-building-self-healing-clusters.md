# Building Self-Healing Clusters with Ansible

Managing large-scale infrastructure requires more than just automation—it requires **resilience**. At HSBC, I managed global Hadoop clusters where every minute of downtime translated to significant operational risk. 

## The Challenge
Manual intervention for common failures (node exhaustion, service crashes, network blips) was consuming 40% of the team's capacity. We needed a system that didn't just alert us when things broke, but fixed them before we even noticed.

## The Solution: Event-Driven Automation
Using **Ansible Tower** in conjunction with **Prometheus** and **Alertmanager**, we built a self-healing pipeline:

1. **Detection**: Prometheus monitors cluster health.
2. **Trigger**: Alertmanager identifies a specific failure signature (e.g., DataNode heap exhaustion).
3. **Execution**: A webhook triggers an Ansible Job Template.
4. **Resolution**: The playbook performs a safe rolling restart or clears cache.

## Results
- **90% reduction** in manual recovery tasks.
- Improved MTTR (Mean Time To Recovery) from **30 minutes to 4 minutes**.
- Guaranteed **99.9% uptime** for critical banking workloads.

Implementing self-healing systems is about moving from "firefighting" to "architecture." By codifying institutional knowledge into playbooks, we ensure the system behaves predictably even under stress.
