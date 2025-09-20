package timepass;
// import java.util.Arrays;
class ex {
    public static void main(String[] args) {
        int[] ar={1,2,3,4,5, 76, 97,1007,1578};
        int tgt=12;
        int ans=binarySearch(ar, tgt);
        System.out.println(ans);
    }
    static int binarySearch(int[] ar, int tgt){
        int st=0, end=ar.length;
        while (st<=end) {
            int md=st+(end-st)/2;
            if(ar[md]>tgt){
                end=md-1;
            }else if (ar[md]<tgt) {
                st=md+1;
            }else{
                return md;
            }
        }
        return -1;
    }
}