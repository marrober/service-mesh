echo "Mutual TLS"
echo "In a DevEx terminal running in the same project enter"
oc new-app --docker-image quay.io/marrober/devex-terminal-4:latest --name 'terminal'
oc expose service/terminal
echo ""
echo "Open the terminal for the new DevEx pod and enter the following command"
echo "curl -s \$LAYER2_SERVICE_HOST:8080/get-json|jq"