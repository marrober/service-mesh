echo "Mutual TLS"
echo "In a DevEx terminal running in the same project enter"
oc new-app --docker-image quay.io/marrober/devex-terminal-4:latest --name 'terminal'
oc expose service/terminal
echo "curl $LAYER2_PORT_8080_TCP_ADDR:8080/call-layers| jq"