// User function Template for Java
package timepass;
class Solution {
    public int[] findFloorAndCeil(int[] arr, int x) {
        int n = arr.length;
        if (n == 0) {
            return new int[]{-1, -1}; // Empty array
        }
        
        int floorIdx = -1, ceilIdx = -1;
        int left = 0, right = n - 1;
        
        while (left <= right) {
            int mid = left + (right - left) / 2;
            
            if (arr[mid] == x) {
                // Exact match: Find leftmost for ceil, rightmost for floor
                floorIdx = mid;
                ceilIdx = mid;
                // Continue left for potential earlier ceil
                right = mid - 1;
                // But to optimize, we can scan left/right, but for simplicity, continue
            } else if (arr[mid] < x) {
                floorIdx = mid; // Best floor so far
                left = mid + 1; // Search right
            } else { // arr[mid] > x
                ceilIdx = mid; // Best ceil so far
                right = mid - 1; // Search left
            }
        }
        
        return new int[]{floorIdx, ceilIdx};
    }
    
    public static void main(String[] args) {
        Solution sol = new Solution();
        int[] arr = {1, 10, 10, 10, 13};
        int x = 10;
        int[] result = sol.findFloorAndCeil(arr, x);
        System.out.println("Floor index: " + result[0] + " (value: " + (result[0] != -1 ? arr[result[0]] : "None") + ")");
        System.out.println("Ceil index: " + result[1] + " (value: " + (result[1] != -1 ? arr[result[1]] : "None") + ")");
    }
}