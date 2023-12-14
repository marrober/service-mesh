echo "Mutual TLS"
oc create -f 04-mtls/layer2-route.yaml
echo ""
oc get route/layer2 -o jsonpath='{"http://"}{.spec.host}{"\n"}'
echo ""

echo "Open the terminal for the new DevEx pod and enter the following command"
echo "curl -s $(oc get route/layer2 -o jsonpath='{"http://"}{.spec.host}'/get-json) |jq"
echo ""
curl -s $(oc get route/layer2 -o jsonpath='{"http://"}{.spec.host}'/get-json) |jq
