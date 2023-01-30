
docker volume rm $(docker volume ls -qf dangling=true)

docker rmi $(docker images -a | grep '^<none>' | awk '{print $3}')

