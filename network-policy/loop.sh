for i in {1..100}; do curl $LEFTROUTE/call-layers; echo ""; curl $ROGUEROUTE/call-layers; echo "";sleep .2;done
