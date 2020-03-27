git add .
git commit -m "update"
git push
oc start-build layers-1
oc start-build layers-2
oc start-build layers-3
