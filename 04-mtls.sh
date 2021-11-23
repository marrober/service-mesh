cd 04-mtls
oc create -f peer-authentication-mtls.yaml

oc delete dr --all
oc create -f destinationrule-mtls.yaml
cd ..
