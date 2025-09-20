package timepass;

public class binarySearch {
    public static void main(String[] args) {
        int[] arr={1,72,72,72,235};
        int x=72;
        int ans=bs(arr,x);
        System.out.println(ans);
    }
    static int bs(int[] ar, int x){
        int st=0,end=ar.length-1;
        int md=0;
        while (st<=end) {
            md=st+(end-st)/2;
            if(ar[md]>x){
                end=md-1;
            }else if(ar[md]<x){
                st=md+1;
            }else{
                return md;
            }
        }
        return st;
    }
}
