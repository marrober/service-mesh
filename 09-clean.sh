oc delete virtualservice.networking.istio.io --all
oc delete destinationrule.networking.istio.io --all
oc delete gateway.networking.istio.io --all
oc get all
oc delete service --all
oc delete route --all
oc delete deployment --all
oc get all
oc delete imagestream.image.openshift.io --all
oc delete -f servicemeshmember.yaml
oc get istio-io
oc get all