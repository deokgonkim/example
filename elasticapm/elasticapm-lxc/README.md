# elasticapm-lxc

Install Elastic APM Stock on LXC container

## Instructions

- Create EC2
    - Name : dev-elasticapm
    - Type : t3.medium (2vCPU, 4GB Memory)
    - Volumes : 20GB for Root, 50GB for Data
- Initialize LVM
    - [LVM.md](LVM)
- Initialize and Create LXC Containers
    - [LXC.md](LXC)


## References

- Install Elasticsearch : https://www.elastic.co/guide/en/elasticsearch/reference/current/install-elasticsearch.html
